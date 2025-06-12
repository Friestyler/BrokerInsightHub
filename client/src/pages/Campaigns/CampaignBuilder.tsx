import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  ListChecks, 
  FormInput, 
  Users, 
  MessageSquare, 
  Settings, 
  Clock, 
  Calendar, 
  Upload,
  Send,
  Plus
} from "lucide-react";
import { 
  useQuery,
  useMutation,
  useQueryClient
} from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useEnvironment } from "@/contexts/EnvironmentContext";

// Step form schemas
const selectListSchema = z.object({
  name: z.string().min(2, "Campaign name is required"),
  listIds: z.array(z.string()).min(1, "At least one target list is required"),
  description: z.string().optional(),
  type: z.string().min(1, "Campaign type is required"),
  category: z.string().optional(),
});

const composeEmailSchema = z.object({
  emailBody: z.string().min(10, "Email content is required"),
  emailLogo: z.string().optional(),
  useAi: z.boolean().optional(),
  aiPrompt: z.string().optional(),
});

const selectRecipientsSchema = z.object({
  recipientIds: z.array(z.string()).min(1, "At least one recipient is required"),
});

const followUpSchema = z.object({
  enableFollowUp: z.boolean().optional(),
  followUpEmails: z.array(z.object({
    delayDays: z.number().min(1, "Delay must be at least 1 day"),
    subject: z.string().optional(),
    emailBody: z.string().optional(),
    attachment: z.string().optional(),
  })).optional(),
});

const campaignSettingsSchema = z.object({
  subject: z.string().min(2, "Subject is required"),
  scheduledTime: z.string().optional(),
  frequency: z.string().default("one_time"),
  fromName: z.string().min(2, "Sender name is required"),
  fromEmail: z.string().email("Invalid email address"),
  isShared: z.boolean().default(false),
});

// Combined campaign schema
const campaignFormSchema = selectListSchema
  .merge(composeEmailSchema)
  .merge(selectRecipientsSchema)
  .merge(followUpSchema)
  .merge(campaignSettingsSchema)
  .extend({
    status: z.string().optional(),
  });

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

// Step interface
interface BuilderStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function CampaignBuilder() {
  const [, params] = useRoute("/campaigns/new");
  const [, setLocation] = useLocation();
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<string>("select-list");
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get template from URL if any
  const searchParams = new URLSearchParams(window.location.search);
  const templateId = searchParams.get("template");

  const { data: entities } = useQuery({
    queryKey: ['/api/entities'],
    enabled: currentStep === "select-list"
  });

  // Fetch all saved lists for target list selection
  const { data: allSavedLists } = useQuery({
    queryKey: ['/api/saved-lists'],
    enabled: currentStep === "select-list"
  });

  const { data: contacts } = useQuery({
    queryKey: ['/api/contacts'],
    enabled: currentStep === "recipients"
  });

  const { data: partners } = useQuery({
    queryKey: ['/api/partners'],
    enabled: currentStep === "recipients"
  });

  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
    enabled: currentStep === "recipients"
  });

  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities'],
    enabled: currentStep === "recipients"
  });

  // Group saved lists by entity type
  const groupedSavedLists = React.useMemo(() => {
    if (!allSavedLists || !Array.isArray(allSavedLists)) return {};
    
    return allSavedLists.reduce((groups: any, list: any) => {
      const entityType = list.entity_type || 'other';
      if (!groups[entityType]) {
        groups[entityType] = [];
      }
      groups[entityType].push(list);
      return groups;
    }, {});
  }, [allSavedLists]);

  // Helper function to format entity type labels
  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case 'partners': return 'Partners';
      case 'customers': return 'Customers';
      case 'opportunities': return 'Opportunities';
      case 'contacts': return 'Contacts';
      default: return 'Other';
    }
  };

  // Form definition
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "cross_sell",
      listIds: [],
      emailBody: "",
      emailLogo: "",
      recipientIds: [],
      enableFollowUp: false,
      followUpEmails: [{ delayDays: 3, subject: "", emailBody: "" }],
      subject: "",
      scheduledTime: "",
      frequency: "one_time",
      fromName: "",
      fromEmail: "",
      isShared: false,
      status: "draft",
    }
  });

  // Get contacts filtered by target lists and group by records
  const groupedContacts = React.useMemo(() => {
    if (!contacts || !Array.isArray(contacts)) return {};
    
    const selectedListIds = form.getValues("listIds") || [];
    let filteredContacts = contacts;
    
    // If target lists were selected, filter contacts by those relationships
    if (selectedListIds.length > 0) {
      // Get all entities from selected lists
      const relatedEntityIds = new Set();
      
      selectedListIds.forEach(listId => {
        const list = Array.isArray(allSavedLists) 
          ? allSavedLists.find((l: any) => l.id.toString() === listId)
          : null;
        if (list && list.members) {
          list.members.forEach((memberId: any) => {
            relatedEntityIds.add(`${list.entity_type}:${memberId}`);
          });
        }
      });
      
      // Filter contacts that have relationships with these entities
      filteredContacts = contacts.filter((contact: any) => {
        if (contact.linked_entity_type === 'customer' && contact.linked_entity_id && relatedEntityIds.has(`customers:${contact.linked_entity_id}`)) return true;
        if (contact.linked_entity_type === 'partner' && contact.linked_entity_id && relatedEntityIds.has(`partners:${contact.linked_entity_id}`)) return true;
        if (contact.linked_entity_type === 'opportunity' && contact.linked_entity_id && relatedEntityIds.has(`opportunities:${contact.linked_entity_id}`)) return true;
        return false;
      });
    }
    
    // Apply search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filteredContacts = filteredContacts.filter((contact: any) => {
        const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase();
        const email = (contact.email || '').toLowerCase();
        const company = (contact.company || '').toLowerCase();
        
        return fullName.includes(searchLower) || 
               email.includes(searchLower) || 
               company.includes(searchLower);
      });
    }
    
    // Group contacts by their related records
    const groups: any = {};
    
    filteredContacts.forEach((contact: any) => {
      let recordName = '';
      let recordType = '';
      
      // Determine the primary record this contact belongs to
      if (contact.linked_entity_type === 'customer' && contact.linked_entity_id) {
        const customer = Array.isArray(customers) 
          ? customers.find((c: any) => c.id === contact.linked_entity_id)
          : null;
        recordName = customer?.name || `Customer ${contact.linked_entity_id}`;
        recordType = 'customer';
      } else if (contact.linked_entity_type === 'partner' && contact.linked_entity_id) {
        const partner = Array.isArray(partners) 
          ? partners.find((p: any) => p.id === contact.linked_entity_id)
          : null;
        recordName = partner?.name || `Partner ${contact.linked_entity_id}`;
        recordType = 'partner';
      } else if (contact.linked_entity_type === 'opportunity' && contact.linked_entity_id) {
        const opportunity = Array.isArray(opportunities) 
          ? opportunities.find((o: any) => o.id === contact.linked_entity_id)
          : null;
        recordName = opportunity?.title || `Opportunity ${contact.linked_entity_id}`;
        recordType = 'opportunity';
      } else {
        recordName = 'Unlinked Contacts';
        recordType = 'unlinked';
      }
      
      if (!groups[recordName]) {
        groups[recordName] = {
          recordType,
          contacts: []
        };
      }
      
      groups[recordName].contacts.push(contact);
    });
    
    // Sort contacts within each group alphabetically
    Object.keys(groups).forEach(recordName => {
      groups[recordName].contacts.sort((a: any, b: any) => {
        const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim();
        const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim();
        return nameA.localeCompare(nameB);
      });
    });
    
    return groups;
  }, [contacts, partners, customers, opportunities, allSavedLists, searchQuery, form.watch("listIds")]);

  // Campaign creation mutation
  const createCampaignMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest('POST', '/api/campaigns', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully",
      });
      setLocation("/campaigns");
    },
    onError: (error) => {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  // Load template data if template ID is provided
  useEffect(() => {
    if (templateId) {
      switch (templateId) {
        case "life-pension":
          form.setValue("name", "Life + Pension Campaign");
          form.setValue("type", "cross_sell");
          form.setValue("category", "Life + Pension");
          form.setValue("emailBody", "Dear valued customer,\n\nWe noticed you already have a pension plan with us. Have you considered adding life insurance to complement your financial security?\n\nOur combined Life + Pension packages offer comprehensive protection for you and your loved ones while optimizing your long-term financial planning.\n\nI'm available to discuss how this could benefit your specific situation.\n\nBest regards,");
          form.setValue("subject", "Enhance Your Financial Security with Life Insurance");
          break;
        case "car-legal":
          form.setValue("name", "Car + Legal Protection Campaign");
          form.setValue("type", "cross_sell");
          form.setValue("category", "Car + Legal");
          form.setValue("emailBody", "Hello,\n\nAs your trusted insurance partner, we want to ensure you have comprehensive protection for all aspects of your driving life.\n\nWe noticed you have auto insurance with us, but without legal protection coverage. Adding legal protection can safeguard you from unexpected legal costs related to your vehicle.\n\nLet's schedule a quick call to discuss how this additional coverage could benefit you.\n\nRegards,");
          form.setValue("subject", "Complete Your Car Insurance with Legal Protection");
          break;
        case "fire-theft":
          form.setValue("name", "Home Protection Bundle");
          form.setValue("type", "cross_sell");
          form.setValue("category", "Fire + Theft");
          form.setValue("emailBody", "Dear homeowner,\n\nYour home is your sanctuary, and we want to help you protect it fully.\n\nWe noticed you have fire insurance with us. Have you considered adding theft protection to ensure complete peace of mind for your property?\n\nOur combined Fire + Theft package offers comprehensive coverage at a competitive rate that might be more cost-effective than separate policies.\n\nI'd be happy to provide more details on how this could work for your property.\n\nYours sincerely,");
          form.setValue("subject", "Complete Home Protection: Adding Theft Coverage");
          break;
        case "axa-life-pension":
          form.setValue("name", "AXA Life & Pension Special Offer");
          form.setValue("type", "custom");
          form.setValue("category", "Life + Pension");
          form.setValue("emailBody", "Dear valued client,\n\nAXA is pleased to present an exclusive offer on our Life & Pension combined packages, designed specifically for our premium customers like you.\n\nThese specially curated packages offer enhanced benefits including:\n\n• Higher interest rates on pension contributions\n• Extended life coverage with no medical examination\n• Flexible withdrawal options\n• Tax optimization strategies\n\nAs your broker, I can provide personalized advice on how these AXA packages can be tailored to your specific needs.\n\nBest regards,");
          form.setValue("subject", "Exclusive AXA Life & Pension Offer for Premium Clients");
          break;
      }
    }
  }, [templateId, form]);

  // Step definitions
  const steps: BuilderStep[] = [
    {
      id: "select-list",
      title: "Select List",
      description: "Choose a target audience and define campaign details",
      icon: <ListChecks className="h-5 w-5" />,
    },
    {
      id: "compose",
      title: "Compose",
      description: "Create your email content",
      icon: <FormInput className="h-5 w-5" />,
    },
    {
      id: "recipients",
      title: "Select Recipients",
      description: "Choose who will receive your campaign",
      icon: <Users className="h-5 w-5" />,
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
      description: "Configure sending options",
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

  // AI prompt handler (simulated)
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
      // Here we would typically call an AI service API
      const generatedText = `Dear valued customer,\n\nBased on your current insurance portfolio, I wanted to reach out about an opportunity that might interest you.\n\n${prompt}\n\nI'd be happy to discuss this in more detail at your convenience.\n\nBest regards,\n[Your Name]`;
      form.setValue("emailBody", generatedText);
      toast({
        title: "Email content generated",
        description: "AI has created content based on your prompt",
      });
    }, 1000);
  };

  // Form submission
  const onSubmit = (data: CampaignFormValues) => {
    setIsSubmitting(true);
    
    // Transform form data to match API schema
    const campaignData = {
      ...data,
      listId: data.listId ? parseInt(data.listId) : null,
      recipientIds: data.recipientIds.map(id => parseInt(id)),
      followUpEmails: data.enableFollowUp ? data.followUpEmails : [],
    };
    
    createCampaignMutation.mutate(campaignData);
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "select-list":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="Enter campaign name"
                {...form.register("name")}
              />
              <p className="text-xs text-gray-500">
                This is to help your team find the campaign. It won't be shown externally.
              </p>
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campaign-description">Description (Optional)</Label>
              <Textarea
                id="campaign-description"
                placeholder="Describe the purpose of this campaign"
                {...form.register("description")}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Campaign Type</Label>
              <RadioGroup 
                defaultValue={form.getValues("type")} 
                onValueChange={(value) => form.setValue("type", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cross_sell" id="cross_sell" />
                  <Label htmlFor="cross_sell">Cross-Sell</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upsell" id="upsell" />
                  <Label htmlFor="upsell">Upsell</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="smart_update" id="smart_update" />
                  <Label htmlFor="smart_update">Smart update</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Custom</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="campaign-category">Category (Optional)</Label>
              <Input
                id="campaign-category"
                placeholder="E.g., Life + Pension, Car + Legal"
                {...form.register("category")}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="list-ids">Target Lists</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between text-left font-normal"
                  >
                    {form.getValues("listIds")?.length > 0 
                      ? `${form.getValues("listIds").length} list${form.getValues("listIds").length > 1 ? 's' : ''} selected`
                      : "Select target lists"
                    }
                    <ListChecks className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-80 overflow-auto">
                    {Object.keys(groupedSavedLists).length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No saved lists available
                      </div>
                    ) : (
                      Object.entries(groupedSavedLists).map(([entityType, lists], groupIndex) => (
                        <div key={entityType}>
                          {/* Add separator for visual grouping */}
                          {groupIndex > 0 && (
                            <div className="border-t border-gray-100 my-1" />
                          )}
                          
                          {/* Category header */}
                          <div className="py-1.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50/80">
                            {getEntityTypeLabel(entityType)}
                          </div>
                          
                          {/* List items with checkboxes */}
                          {(lists as any[]).map((list: any) => {
                            const currentValues = form.getValues("listIds") || [];
                            const listId = list.id.toString();
                            const isSelected = currentValues.includes(listId);
                            
                            return (
                              <div 
                                key={list.id}
                                className="flex items-start space-x-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                onClick={() => {
                                  if (isSelected) {
                                    form.setValue("listIds", currentValues.filter(id => id !== listId));
                                  } else {
                                    form.setValue("listIds", [...currentValues, listId]);
                                  }
                                }}
                              >
                                <Checkbox
                                  checked={isSelected}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-gray-900">
                                    {list.name}
                                  </div>
                                  {list.description && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                      {list.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-500">
                Select one or more audience segments for your campaign
              </p>
            </div>
          </div>
        );
      
      case "compose":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-start mb-2">
              <div className="space-y-2">
                <Label>Email Content</Label>
                <div className="flex space-x-2 items-center">
                  <input
                    type="checkbox"
                    id="use-ai"
                    checked={showAiPrompt}
                    onChange={() => setShowAiPrompt(!showAiPrompt)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <Label htmlFor="use-ai" className="text-sm font-normal">Use AI to help write content</Label>
                </div>
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
                <Label htmlFor="ai-prompt">AI Prompt</Label>
                <div className="flex space-x-2">
                  <Input
                    id="ai-prompt"
                    placeholder="Describe what you want the email to say..."
                    {...form.register("aiPrompt")}
                  />
                  <Button 
                    type="button" 
                    onClick={handleGenerateFromPrompt}
                    className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
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
              <Textarea
                id="email-body"
                placeholder="Compose your email content here..."
                className="min-h-[300px]"
                {...form.register("emailBody")}
              />
              {form.formState.errors.emailBody && (
                <p className="text-sm text-red-500">{form.formState.errors.emailBody.message}</p>
              )}
            </div>
            
            <div className="flex space-x-2 justify-end">
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                className="text-xs"
              >
                Add Hyperlink
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                className="text-xs"
              >
                Add Button
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                className="text-xs"
              >
                Add Form
              </Button>
            </div>
          </div>
        );
      
      case "recipients":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Recipients</Label>
              <p className="text-sm text-gray-500 mb-2">
                Choose contacts who will receive this campaign
              </p>
              
              <div className="border rounded-md max-h-[400px] overflow-y-auto">
                <div className="p-2 sticky top-0 bg-gray-50 border-b">
                  <Input 
                    placeholder="Search contacts..." 
                    className="text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="p-2">
                  {contacts && Array.isArray(contacts) && contacts.length > 0 ? (
                    Object.keys(groupedContacts).length > 0 ? (
                      // Sort record names alphabetically and display groups
                      Object.keys(groupedContacts)
                        .sort((a, b) => a.localeCompare(b))
                        .map((recordName) => {
                          const group = groupedContacts[recordName];
                          const recordTypeIcon = group.recordType === 'customer' ? '👤' : 
                                                 group.recordType === 'partner' ? '🤝' : 
                                                 group.recordType === 'opportunity' ? '💼' : '📧';
                          
                          return (
                            <div key={recordName} className="mb-4">
                              {/* Record group header */}
                              <div className="flex items-center space-x-2 py-2 px-3 bg-gray-50 rounded-md mb-2">
                                <span className="text-sm">{recordTypeIcon}</span>
                                <span className="font-medium text-sm text-gray-700">{recordName}</span>
                                <span className="text-xs text-gray-500">
                                  ({group.contacts.length} contact{group.contacts.length !== 1 ? 's' : ''})
                                </span>
                              </div>
                              
                              {/* Contacts in this group */}
                              <div className="pl-4 space-y-1">
                                {group.contacts.map((contact: any) => (
                                  <div key={contact.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                                    <input
                                      type="checkbox"
                                      id={`contact-${contact.id}`}
                                      value={contact.id.toString()}
                                      checked={form.getValues("recipientIds").includes(contact.id.toString())}
                                      onChange={(e) => {
                                        const currentIds = form.getValues("recipientIds");
                                        if (e.target.checked) {
                                          form.setValue("recipientIds", [...currentIds, e.target.value]);
                                        } else {
                                          form.setValue("recipientIds", currentIds.filter(cid => cid !== e.target.value));
                                        }
                                      }}
                                      className="rounded text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <Label htmlFor={`contact-${contact.id}`} className="text-sm font-normal cursor-pointer flex-1">
                                      <div className="font-medium">
                                        {contact.first_name} {contact.last_name}
                                      </div>
                                      <div className="text-xs text-gray-500">{contact.email}</div>
                                      {contact.company && (
                                        <div className="text-xs text-gray-400">{contact.company}</div>
                                      )}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {form.getValues("listIds").length > 0 
                          ? "No contacts found for the selected target lists" 
                          : "No contacts match your search"
                        }
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      {contacts === undefined ? "Loading contacts..." : "No contacts found"}
                    </div>
                  )}
                </div>
              </div>
              {form.formState.errors.recipientIds && (
                <p className="text-sm text-red-500">{form.formState.errors.recipientIds.message}</p>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {form.getValues("recipientIds").length} recipient(s) selected
                {Object.keys(groupedContacts).length > 0 && (
                  <span className="text-gray-400 ml-2">
                    from {Object.values(groupedContacts).reduce((total: number, group: any) => total + group.contacts.length, 0)} total contacts
                  </span>
                )}
              </span>
              <Button 
                variant="outline" 
                type="button"
                className="text-sm"
                onClick={() => setLocation("/contacts/new")}
              >
                <Plus className="h-4 w-4 mr-1" /> Add New Contact
              </Button>
            </div>
          </div>
        );
      
      case "follow-up":
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enable-follow-up"
                checked={form.getValues("enableFollowUp")}
                onChange={(e) => form.setValue("enableFollowUp", e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="enable-follow-up">Schedule follow-up messages</Label>
            </div>
            
            {form.getValues("enableFollowUp") && (
              <div className="space-y-4 p-4 border rounded-md">
                <h3 className="font-medium">Follow-up #1</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="follow-up-delay">Send after</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="follow-up-delay"
                      type="number"
                      min="1"
                      className="w-20"
                      value={form.getValues("followUpEmails")?.[0]?.delayDays || "3"}
                      onChange={(e) => {
                        const currentFollowUps = form.getValues("followUpEmails") || [];
                        const updatedFollowUps = [...currentFollowUps];
                        updatedFollowUps[0] = {
                          ...updatedFollowUps[0],
                          delayDays: parseInt(e.target.value, 10)
                        };
                        form.setValue("followUpEmails", updatedFollowUps);
                      }}
                    />
                    <span>days</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="follow-up-subject">Subject (Optional)</Label>
                  <Input
                    id="follow-up-subject"
                    placeholder="Follow-up subject line"
                    value={form.getValues("followUpEmails")?.[0]?.subject || ""}
                    onChange={(e) => {
                      const currentFollowUps = form.getValues("followUpEmails") || [];
                      const updatedFollowUps = [...currentFollowUps];
                      updatedFollowUps[0] = {
                        ...updatedFollowUps[0],
                        subject: e.target.value
                      };
                      form.setValue("followUpEmails", updatedFollowUps);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="follow-up-body">Message</Label>
                  <Textarea
                    id="follow-up-body"
                    placeholder="Enter follow-up message content"
                    className="min-h-[150px]"
                    value={form.getValues("followUpEmails")?.[0]?.emailBody || ""}
                    onChange={(e) => {
                      const currentFollowUps = form.getValues("followUpEmails") || [];
                      const updatedFollowUps = [...currentFollowUps];
                      updatedFollowUps[0] = {
                        ...updatedFollowUps[0],
                        emailBody: e.target.value
                      };
                      form.setValue("followUpEmails", updatedFollowUps);
                    }}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    type="button"
                    size="sm"
                    className="text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" /> Add Attachment
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  type="button"
                  className="w-full border-dashed text-gray-500"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Another Follow-up
                </Button>
              </div>
            )}
          </div>
        );
      
      case "settings":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="Enter email subject"
                {...form.register("subject")}
              />
              {form.formState.errors.subject && (
                <p className="text-sm text-red-500">{form.formState.errors.subject.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scheduled-time">Schedule (Optional)</Label>
              <Input
                id="scheduled-time"
                type="datetime-local"
                {...form.register("scheduledTime")}
              />
              <p className="text-xs text-gray-500">
                Leave empty to send immediately after saving
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select 
                onValueChange={(value) => form.setValue("frequency", value)}
                defaultValue={form.getValues("frequency")}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">One-time</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="py-2">
              <Label className="mb-2 block">Sender</Label>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sender-own"
                    name="sender-type"
                    value="own"
                    defaultChecked
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <Label htmlFor="sender-own" className="mb-1 block">Connect your email</Label>
                    <Button 
                      variant="outline" 
                      type="button"
                      size="sm"
                      className="text-sm"
                    >
                      Connect Email Account
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sender-qollabi"
                    name="sender-type"
                    value="qollabi"
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <Label htmlFor="sender-qollabi" className="mb-1 block">Via Qollabi</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="from-name"
                        placeholder="Your name"
                        className="w-1/2"
                        {...form.register("fromName")}
                      />
                      <div className="flex items-center space-x-0 w-1/2">
                        <Input
                          id="from-username"
                          placeholder="Username"
                          className="rounded-r-none w-full"
                          {...form.register("fromEmail")}
                        />
                        <div className="border border-l-0 rounded-r-md px-3 py-2 bg-gray-50 text-gray-500">
                          @qollabi.net
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="share-campaign"
                checked={form.getValues("isShared")}
                onChange={(e) => form.setValue("isShared", e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="share-campaign">Share this campaign with team members</Label>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Progress indicator
  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="pl-0 text-gray-500"
          onClick={() => setLocation("/campaigns")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Campaigns
        </Button>
        <h1 className="text-2xl font-bold mt-2">{form.getValues("name") || "New Campaign"}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Step navigation sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Campaign Builder</CardTitle>
              <CardDescription>Complete these steps</CardDescription>
            </CardHeader>
            <CardContent>
              <nav>
                <ul className="space-y-1">
                  {steps.map((step) => {
                    const status = getStepStatus(step.id);
                    return (
                      <li key={step.id}>
                        <button
                          type="button"
                          className={`w-full flex items-center p-2 rounded-md transition-colors ${
                            status === "current"
                              ? "bg-indigo-50 text-indigo-600"
                              : status === "completed"
                              ? "text-gray-700 hover:bg-gray-50"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                          onClick={() => goToStep(step.id)}
                        >
                          <span className={`h-5 w-5 mr-2 flex-shrink-0 rounded-full flex items-center justify-center ${
                            status === "completed"
                              ? "bg-indigo-500 text-white"
                              : status === "current"
                              ? "border-2 border-indigo-500 text-indigo-500"
                              : "border-2 border-gray-300 text-gray-300"
                          }`}>
                            {status === "completed" ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <span className="text-xs font-medium">
                                {steps.findIndex(s => s.id === step.id) + 1}
                              </span>
                            )}
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
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.setValue("status", "draft");
                      form.handleSubmit(onSubmit)();
                    }}
                    disabled={isSubmitting}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => {
                      form.setValue("status", "active");
                      form.handleSubmit(onSubmit)();
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save and Send"} <Send className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <Button 
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700"
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