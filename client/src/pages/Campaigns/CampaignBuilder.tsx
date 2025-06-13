import React, { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useNavigationHistory } from "@/hooks/useNavigationHistory";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  Save, 
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
  shareType: z.string().optional(),
  sharedPartnerIds: z.array(z.string()).optional(),
  sharedUserIds: z.array(z.string()).optional(),
  shareAccessLevel: z.string().optional(),
  shareMessage: z.string().optional(),
  sharedContactIds: z.array(z.string()).optional(),
  saveAsTemplate: z.boolean().default(false),
  templateName: z.string().optional(),
  templateDescription: z.string().optional(),
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

// Contact creation schema
const contactFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  department: z.string().optional(),
  company: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

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
  const { goBack } = useNavigationHistory("/campaigns");
  const { environment } = useEnvironment();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState<string>("select-list");
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // New contact dialog state
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<{ name: string; type: string; id: number } | null>(null);

  // Get template from URL if any
  const searchParams = new URLSearchParams(window.location.search);
  const templateId = searchParams.get("template");

  // Fetch template data if templateId is provided
  const { data: templateData } = useQuery({
    queryKey: ['/api/campaign-templates', templateId],
    enabled: !!templateId,
  });

  const { data: entities } = useQuery({
    queryKey: ['/api/entities'],
    enabled: currentStep === "select-list"
  });

  // Fetch all saved lists for target list selection
  const { data: allSavedLists } = useQuery({
    queryKey: ['/api/saved-lists'],
    enabled: currentStep === "select-list"
  });

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
      shareType: "team",
      sharedPartnerIds: [],
      sharedUserIds: [],
      shareAccessLevel: "view",
      shareMessage: "",
      sharedContactIds: [],
      saveAsTemplate: false,
      templateName: "",
      templateDescription: "",
      status: "draft",
    }
  });

  // Watch the recipientIds to ensure UI updates
  const selectedRecipientIds = form.watch("recipientIds");
  const saveAsTemplate = form.watch("saveAsTemplate");
  const isShared = form.watch("isShared");
  const shareType = form.watch("shareType");
  const sharedPartnerIds = form.watch("sharedPartnerIds");
  const sharedUserIds = form.watch("sharedUserIds");

  // Initialize form with template data when available
  useEffect(() => {
    if (templateData && templateData.name) {
      form.reset({
        name: templateData.name + " (Copy)",
        description: templateData.description || "",
        type: templateData.type || "cross_sell",
        listIds: [],
        emailBody: templateData.emailBody || "",
        emailLogo: templateData.emailLogo || "",
        recipientIds: [],
        enableFollowUp: false,
        followUpEmails: templateData.followUpEmails || [{ delayDays: 3, subject: "", emailBody: "" }],
        subject: templateData.subject || "",
        scheduledTime: "",
        frequency: "one_time",
        fromName: templateData.fromName || "",
        fromEmail: templateData.fromEmail || "",
        isShared: false,
        shareType: "team",
        sharedPartnerIds: [],
        sharedUserIds: [],
        shareAccessLevel: "view",
        shareMessage: "",
        sharedContactIds: [],
        saveAsTemplate: false,
        templateName: "",
        templateDescription: "",
        status: "draft",
      });
    }
  }, [templateData, form]);

  const { data: contacts } = useQuery({
    queryKey: ['/api/contacts'],
    enabled: currentStep === "recipients" || currentStep === "settings"
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    enabled: currentStep === "settings"
  });

  const { data: partners } = useQuery({
    queryKey: ['/api/partners'],
    enabled: currentStep === "recipients" || currentStep === "settings"
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

  // Contact form for new contact creation
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      job_title: "",
      department: "",
      company: "",
    }
  });

  // Contact creation mutation
  const createContactMutation = useMutation({
    mutationFn: async (contactData: ContactFormValues & { linked_entity_type: string; linked_entity_id: number }) => {
      const response = await fetch(`/api/${environment}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create contact');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
      setShowContactDialog(false);
      contactForm.reset();
      toast({
        title: "Success",
        description: "Contact created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create contact",
        variant: "destructive",
      });
    },
  });

  // Handle contact creation
  const handleCreateContact = (data: ContactFormValues) => {
    if (!selectedRecord) return;
    
    createContactMutation.mutate({
      ...data,
      linked_entity_type: selectedRecord.type,
      linked_entity_id: selectedRecord.id,
    });
  };

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
      return apiRequest('POST', '/api/degoudse/campaigns', data);
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

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest('POST', '/api/degoudse/campaigns', { ...data, status: 'draft' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      toast({
        title: "Draft saved",
        description: "Your campaign draft has been saved successfully",
      });
    },
    onError: (error) => {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Template loading query
  const templateQuery = useQuery({
    queryKey: ['/api/campaign-templates', templateId],
    queryFn: () => {
      if (!templateId || isNaN(parseInt(templateId))) return null;
      return apiRequest('GET', `/api/campaign-templates/${templateId}`);
    },
    enabled: !!templateId && !isNaN(parseInt(templateId))
  });

  // Load template data if template ID is provided
  useEffect(() => {
    if (templateQuery.data) {
      const template = templateQuery.data;
      
      // Pre-populate all fields from the template
      form.setValue("name", template.name + " - Copy");
      form.setValue("type", template.type || "");
      form.setValue("category", template.category || "");
      form.setValue("emailBody", template.emailBody || "");
      form.setValue("subject", template.subject || "");
      form.setValue("frequency", template.frequency || "one_time");
      form.setValue("fromName", template.fromName || "");
      form.setValue("fromEmail", template.fromEmail || "");
      form.setValue("emailLogo", template.emailLogo || "");
      
      // Load follow-up settings if they exist
      if (template.enableFollowUp) {
        form.setValue("enableFollowUp", true);
        if (template.followUpEmails && template.followUpEmails.length > 0) {
          form.setValue("followUpEmails", template.followUpEmails);
        }
      }
      
      toast({
        title: "Template loaded",
        description: `Campaign populated with template: ${template.name}`,
      });
    }
  }, [templateQuery.data, form]);

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
      // Template creation success handled here
      setIsSubmitting(false);
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

  // Form submission
  const onSubmit = async (data: CampaignFormValues) => {
    setIsSubmitting(true);
    
    // Transform form data to match API schema
    const campaignData = {
      ...data,
      listIds: data.listIds,
      recipientIds: data.recipientIds ? data.recipientIds.map(id => parseInt(id)) : [],
      followUpEmails: data.enableFollowUp ? data.followUpEmails : [],
    };

    // Remove template-specific fields from campaign data
    const { saveAsTemplate, templateName, templateDescription, ...cleanCampaignData } = campaignData;
    
    // Include sharing data in campaign
    if (data.isShared) {
      (cleanCampaignData as any).sharing = {
        sharedPartnerIds: data.sharedPartnerIds || [],
        shareAccessLevel: data.shareAccessLevel || "view",
        shareMessage: data.shareMessage || "",
        sharedContactIds: data.sharedContactIds || []
      };
    }
    
    // If saving as template, create the template first
    if (data.saveAsTemplate && data.templateName) {
      const templateData = {
        name: data.templateName,
        description: data.templateDescription || "",
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
      
      try {
        await createTemplateMutation.mutateAsync(templateData);
      } catch (error) {
        // Continue with campaign creation even if template fails
        console.warn("Template creation failed, continuing with campaign:", error);
      }
    }
    
    createCampaignMutation.mutate(cleanCampaignData);
  };

  // Save draft function
  const saveDraft = async () => {
    const formData = form.getValues();
    
    // Transform form data to match API schema
    const draftData = {
      name: formData.name || "Untitled Campaign",
      description: formData.description || "",
      type: formData.type || "cross_sell",
      category: formData.category || "",
      status: "draft",
      subject: formData.subject || "",
      emailBody: formData.emailBody || "",
      emailLogo: formData.emailLogo || "",
      fromName: formData.fromName || "",
      fromEmail: formData.fromEmail || "",
      followUpEmails: formData.enableFollowUp ? formData.followUpEmails : [],
      frequency: formData.frequency || "one_time",
      isShared: false,
      isTemplate: false,
      tags: [],
    };

    saveDraftMutation.mutate(draftData);
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
                                      checked={selectedRecipientIds?.includes(contact.id.toString()) || false}
                                      onChange={(e) => {
                                        const currentIds = selectedRecipientIds || [];
                                        const contactId = contact.id.toString();
                                        
                                        if (e.target.checked) {
                                          const newIds = [...currentIds, contactId];
                                          form.setValue("recipientIds", newIds);
                                        } else {
                                          const newIds = currentIds.filter(cid => cid !== contactId);
                                          form.setValue("recipientIds", newIds);
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
                                
                                {/* Add Contact Button */}
                                <div className="pt-2">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-xs text-gray-500 hover:text-gray-700 border-dashed border hover:border-solid"
                                    onClick={() => {
                                      // Get record ID based on type and record name
                                      let recordId = 0;
                                      let entityType = group.recordType;
                                      
                                      if (group.recordType === 'customer') {
                                        const customer = Array.isArray(customers) 
                                          ? customers.find((c: any) => c.name === recordName)
                                          : null;
                                        recordId = customer?.id || 0;
                                      } else if (group.recordType === 'partner') {
                                        const partner = Array.isArray(partners) 
                                          ? partners.find((p: any) => p.name === recordName)
                                          : null;
                                        recordId = partner?.id || 0;
                                      } else if (group.recordType === 'opportunity') {
                                        const opportunity = Array.isArray(opportunities) 
                                          ? opportunities.find((o: any) => o.title === recordName)
                                          : null;
                                        recordId = opportunity?.id || 0;
                                      }
                                      
                                      setSelectedRecord({
                                        name: recordName,
                                        type: entityType,
                                        id: recordId
                                      });
                                      setShowContactDialog(true);
                                    }}
                                  >
                                    <Plus className="h-3 w-3 mr-1" /> Add Contact
                                  </Button>
                                </div>
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
                {selectedRecipientIds?.length || 0} recipient(s) selected
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
            
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="share-campaign"
                  checked={form.getValues("isShared")}
                  onChange={(e) => form.setValue("isShared", e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="share-campaign">Share this campaign with team members</Label>
              </div>
              
              {isShared && (
                <div className="ml-6 space-y-4 border-l-2 border-gray-200 pl-4">
                  {/* Sharing type selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Share With</Label>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="share-with-team"
                          name="share-type"
                          value="team"
                          checked={shareType === "team" || !shareType}
                          onChange={(e) => {
                            if (e.target.checked) {
                              form.setValue("shareType", "team");
                              form.setValue("sharedPartnerIds", []);
                              form.setValue("sharedContactIds", []);
                            }
                          }}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <Label htmlFor="share-with-team" className="text-sm">Internal Team Members</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="share-with-partners"
                          name="share-type"
                          value="partners"
                          checked={shareType === "partners"}
                          onChange={(e) => {
                            if (e.target.checked) {
                              form.setValue("shareType", "partners");
                              form.setValue("sharedUserIds", []);
                            }
                          }}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <Label htmlFor="share-with-partners" className="text-sm">External Parties</Label>
                      </div>
                    </div>
                  </div>

                  {/* Team member selection */}
                  {(!shareType || shareType === "team") && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Select Team Members</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                        {users && Array.isArray(users) && users.length > 0 ? (
                          users.map((user: any) => {
                            const currentSharedUserIds = sharedUserIds || [];
                            const isChecked = currentSharedUserIds.includes(user.id);
                            
                            return (
                              <div key={user.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`team-member-${user.id}`}
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const currentIds = sharedUserIds || [];
                                    if (e.target.checked) {
                                      form.setValue("sharedUserIds", [...currentIds, user.id]);
                                    } else {
                                      form.setValue("sharedUserIds", currentIds.filter((id: number) => id !== user.id));
                                    }
                                  }}
                                  className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <Label htmlFor={`team-member-${user.id}`} className="text-sm">
                                  {user.fullName} ({user.email || user.role})
                                </Label>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-sm text-gray-500 py-2">
                            Loading team members...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Partner and contact selection */}
                  {shareType === "partners" && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Select Partners to Share With</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                          {Array.isArray(partners) && partners.map((partner: any) => (
                            <div key={partner.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`partner-${partner.id}`}
                                checked={form.getValues("sharedPartnerIds")?.includes(partner.id.toString()) || false}
                                onChange={(e) => {
                                  const currentIds = form.getValues("sharedPartnerIds") || [];
                                  const partnerId = partner.id.toString();
                                  if (e.target.checked) {
                                    form.setValue("sharedPartnerIds", [...currentIds, partnerId]);
                                  } else {
                                    form.setValue("sharedPartnerIds", currentIds.filter(id => id !== partnerId));
                                  }
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <Label htmlFor={`partner-${partner.id}`} className="text-sm">
                                {partner.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Contact selection for selected partners */}
                      {sharedPartnerIds && sharedPartnerIds.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Select Contacts from Partners</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                            {Array.isArray(contacts) && contacts
                              .filter((contact: any) => 
                                sharedPartnerIds.some((partnerId: string) => 
                                  contact.partner_id?.toString() === partnerId
                                )
                              )
                              .map((contact: any) => (
                                <div key={contact.id} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`contact-${contact.id}`}
                                    checked={form.getValues("sharedContactIds")?.includes(contact.id.toString()) || false}
                                    onChange={(e) => {
                                      const currentIds = form.getValues("sharedContactIds") || [];
                                      const contactId = contact.id.toString();
                                      if (e.target.checked) {
                                        form.setValue("sharedContactIds", [...currentIds, contactId]);
                                      } else {
                                        form.setValue("sharedContactIds", currentIds.filter(id => id !== contactId));
                                      }
                                    }}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <Label htmlFor={`contact-${contact.id}`} className="text-sm">
                                    {contact.first_name} {contact.last_name} ({contact.email})
                                  </Label>
                                </div>
                              ))
                            }
                            {(!contacts || !Array.isArray(contacts) || contacts.filter((contact: any) => 
                              sharedPartnerIds.some((partnerId: string) => 
                                contact.partner_id?.toString() === partnerId
                              )
                            ).length === 0) && (
                              <p className="text-sm text-gray-500">No contacts found for selected partners</p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Access Level</Label>
                    <select 
                      value={form.getValues("shareAccessLevel") || "view"}
                      onChange={(e) => form.setValue("shareAccessLevel", e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="view">View Only - Can see campaign content</option>
                      <option value="comment">Comment - Can add feedback and notes</option>
                      <option value="edit">Edit - Can modify campaign content</option>
                      <option value="admin">Admin - Full control including sharing</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Share Message (optional)</Label>
                    <Textarea
                      placeholder="Add a message for shared recipients..."
                      value={form.getValues("shareMessage") || ""}
                      onChange={(e) => form.setValue("shareMessage", e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="save-as-template"
                  checked={saveAsTemplate}
                  onChange={(e) => form.setValue("saveAsTemplate", e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="save-as-template">Save as template for future campaigns</Label>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                This will create a reusable template with your campaign settings and content
              </p>
              
              {saveAsTemplate && (
                <div className="mt-3 ml-6 space-y-2">
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    placeholder="e.g., Property Cross-sell Template"
                    value={form.getValues("templateName") || ""}
                    onChange={(e) => form.setValue("templateName", e.target.value)}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="template-description">Description (optional)</Label>
                    <Textarea
                      id="template-description"
                      placeholder="Describe when and how to use this template..."
                      className="min-h-[80px]"
                      value={form.getValues("templateDescription") || ""}
                      onChange={(e) => form.setValue("templateDescription", e.target.value)}
                    />
                  </div>
                </div>
              )}
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
          onClick={goBack}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
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
                    {isSubmitting ? "Saving..." : "Save and Send"} 
                    <Send className="h-4 w-4 ml-1" />
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

      {/* Add Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Create a new contact for {selectedRecord?.name}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={contactForm.handleSubmit(handleCreateContact)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  {...contactForm.register("first_name")}
                  placeholder="John"
                />
                {contactForm.formState.errors.first_name && (
                  <p className="text-sm text-red-500">{contactForm.formState.errors.first_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  {...contactForm.register("last_name")}
                  placeholder="Smith"
                />
                {contactForm.formState.errors.last_name && (
                  <p className="text-sm text-red-500">{contactForm.formState.errors.last_name.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...contactForm.register("email")}
                placeholder="john.smith@company.com"
              />
              {contactForm.formState.errors.email && (
                <p className="text-sm text-red-500">{contactForm.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                {...contactForm.register("phone")}
                placeholder="+31 20 123 4567"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title (optional)</Label>
                <Input
                  id="job_title"
                  {...contactForm.register("job_title")}
                  placeholder="CEO"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department (optional)</Label>
                <Input
                  id="department"
                  {...contactForm.register("department")}
                  placeholder="Management"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company (optional)</Label>
              <Input
                id="company"
                {...contactForm.register("company")}
                placeholder="Company Name"
              />
            </div>
          </form>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowContactDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={contactForm.handleSubmit(handleCreateContact)}
              disabled={createContactMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createContactMutation.isPending ? "Creating..." : "Create Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}