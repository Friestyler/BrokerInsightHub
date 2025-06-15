import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Save, Mail, Target, Clock, Plus, X, FileText, Users, Building2, Briefcase, Check, Sparkles, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailStep {
  id: string;
  subject: string;
  content: string;
  followUpDays: number;
  variables: string[];
}

interface TemplateFormData {
  name: string;
  description: string;
  entity_type: string;
  objective: string;
  emails: EmailStep[];
  status: 'draft' | 'published';
  category: string;
  tags: string[];
}

const templateBlueprints = {
  opportunities: {
    name: "Opportunity Follow-up Campaign",
    description: "Systematic follow-up sequence for insurance opportunities with risk assessment and proposal scheduling",
    objective: "Convert qualified leads into policy applications through structured touchpoints and risk evaluation",
    emails: [
      {
        id: "email-1",
        subject: "Thank you for your interest in {{company_name}} insurance",
        content: `Dear {{contact_name}},

Thank you for expressing interest in our insurance solutions. I'm {{agent_name}}, your dedicated insurance advisor at {{company_name}}.

I understand you're looking for {{insurance_type}} coverage. Based on the information you've provided, I'd like to schedule a brief consultation to better understand your specific needs and provide you with a customized quote.

Key benefits of working with {{company_name}}:
• Competitive rates and comprehensive coverage options
• 24/7 customer support and claims processing
• Flexible payment plans tailored to your budget
• Local expertise with personalized service

Would you be available for a 15-minute call this week? I have openings on {{available_times}}.

Best regards,
{{agent_name}}
{{company_name}}
{{phone_number}}`,
        followUpDays: 0,
        variables: ["contact_name", "company_name", "agent_name", "insurance_type", "available_times", "phone_number"]
      },
      {
        id: "email-2",
        subject: "Your personalized {{insurance_type}} insurance quote",
        content: `Hi {{contact_name}},

Following our conversation, I've prepared a personalized {{insurance_type}} insurance quote based on your specific requirements.

Your Quote Summary:
• Coverage Type: {{coverage_details}}
• Annual Premium: {{premium_amount}}
• Deductible: {{deductible_amount}}
• Policy Benefits: {{key_benefits}}

This quote is valid for 30 days and includes all the coverage options we discussed. I've also included a comparison chart showing how this plan stacks up against standard market offerings.

Next Steps:
1. Review the attached proposal document
2. Schedule a follow-up call to discuss any questions
3. Complete the application if you're ready to proceed

I'm available at {{phone_number}} or you can reply to this email with any questions.

Best regards,
{{agent_name}}`,
        followUpDays: 3,
        variables: ["contact_name", "insurance_type", "coverage_details", "premium_amount", "deductible_amount", "key_benefits", "agent_name", "phone_number"]
      },
      {
        id: "email-3",
        subject: "Final reminder: Your {{insurance_type}} quote expires soon",
        content: `Hi {{contact_name}},

I wanted to reach out one more time regarding your {{insurance_type}} insurance quote. Your personalized rate of {{premium_amount}} is set to expire in {{days_remaining}} days.

Since we last spoke, I've been following market trends and can confirm this remains one of the most competitive rates available for your coverage needs.

If you have any final questions or concerns, I'm here to help. You can:
• Call me directly at {{phone_number}}
• Reply to this email
• Schedule a quick call using this link: {{calendar_link}}

If you've decided to go with another provider, I'd appreciate a quick note so I can update your file accordingly.

Thank you for considering {{company_name}} for your insurance needs.

Best regards,
{{agent_name}}`,
        followUpDays: 7,
        variables: ["contact_name", "insurance_type", "premium_amount", "days_remaining", "phone_number", "calendar_link", "company_name", "agent_name"]
      }
    ]
  },
  customers: {
    name: "Customer Retention & Cross-sell Campaign",
    description: "Nurture existing customers with policy reviews, additional coverage opportunities, and renewal reminders",
    objective: "Increase customer lifetime value through policy expansion and ensure high retention rates",
    emails: [
      {
        id: "email-1",
        subject: "Time for your annual {{policy_type}} policy review",
        content: `Dear {{customer_name}},

I hope this message finds you well. As your insurance advisor at {{company_name}}, I wanted to reach out regarding your {{policy_type}} policy that's coming up for renewal on {{renewal_date}}.

Annual Policy Review Benefits:
• Ensure your coverage still meets your current needs
• Identify potential savings or optimization opportunities  
• Discuss any life changes that might affect your coverage
• Review market changes and new product offerings

Your Current Policy Summary:
• Policy Number: {{policy_number}}
• Current Premium: {{current_premium}}
• Coverage Amount: {{coverage_amount}}
• Deductible: {{deductible}}

I'd like to schedule a brief 20-minute review call to make sure you're getting the best value from your coverage. Would {{suggested_times}} work for you?

Best regards,
{{agent_name}}
{{company_name}}
{{phone_number}}`,
        followUpDays: 0,
        variables: ["customer_name", "company_name", "policy_type", "renewal_date", "policy_number", "current_premium", "coverage_amount", "deductible", "suggested_times", "agent_name", "phone_number"]
      },
      {
        id: "email-2",
        subject: "Additional coverage opportunities for {{customer_name}}",
        content: `Hi {{customer_name}},

Thank you for taking the time to review your {{policy_type}} coverage with me. Based on our conversation and your current life situation, I've identified some additional coverage options that could provide valuable protection.

Recommended Coverage Options:
• {{recommended_coverage_1}}: {{benefit_description_1}}
• {{recommended_coverage_2}}: {{benefit_description_2}}
• {{recommended_coverage_3}}: {{benefit_description_3}}

Bundle Savings Opportunity:
By adding {{recommended_coverage_1}} to your existing policy, you could save {{potential_savings}} annually through our multi-policy discount.

I've prepared detailed information about each option, including:
✓ Coverage details and benefits
✓ Premium costs and payment options
✓ Real-world scenarios where this coverage helps
✓ Customer testimonials and case studies

Would you like to schedule a follow-up call to discuss these options in detail?

Best regards,
{{agent_name}}`,
        followUpDays: 5,
        variables: ["customer_name", "policy_type", "recommended_coverage_1", "benefit_description_1", "recommended_coverage_2", "benefit_description_2", "recommended_coverage_3", "benefit_description_3", "potential_savings", "agent_name"]
      }
    ]
  },
  partners: {
    name: "Partner Relationship & Performance Campaign",
    description: "Strengthen broker partnerships with performance insights, new product updates, and collaboration opportunities",
    objective: "Enhance partner engagement and drive mutual growth through strategic communication and support",
    emails: [
      {
        id: "email-1",
        subject: "Your Q{{quarter}} performance summary and growth opportunities",
        content: `Dear {{partner_name}},

I hope you're having a great {{current_month}}! I wanted to share your performance summary for Q{{quarter}} and discuss some exciting growth opportunities.

Your Q{{quarter}} Highlights:
• Total Policies Written: {{policies_count}}
• Premium Volume: {{premium_volume}}
• Conversion Rate: {{conversion_rate}}
• Portfolio Growth: {{growth_percentage}} vs. last quarter

Top Performing Products:
1. {{top_product_1}} - {{product_1_performance}}
2. {{top_product_2}} - {{product_2_performance}}
3. {{top_product_3}} - {{product_3_performance}}

Growth Opportunities:
Based on market analysis and your client base, I see significant potential in:
• {{opportunity_1}} - Market demand up {{demand_increase_1}}
• {{opportunity_2}} - Perfect fit for {{client_segment}}
• {{opportunity_3}} - New product launch with {{special_incentive}}

I'd love to schedule a strategy call to discuss how we can capitalize on these opportunities together. Are you available for a 30-minute call next week?

Best regards,
{{your_name}}
{{company_name}}`,
        followUpDays: 0,
        variables: ["partner_name", "current_month", "quarter", "policies_count", "premium_volume", "conversion_rate", "growth_percentage", "top_product_1", "product_1_performance", "top_product_2", "product_2_performance", "top_product_3", "product_3_performance", "opportunity_1", "demand_increase_1", "opportunity_2", "client_segment", "opportunity_3", "special_incentive", "your_name", "company_name"]
      },
      {
        id: "email-2",
        subject: "New product launch: {{new_product_name}} - Exclusive partner preview",
        content: `Hi {{partner_name}},

I'm excited to give you an exclusive first look at our newest product: {{new_product_name}}. As one of our valued partners, you get early access before the official market launch.

Product Overview:
• Target Market: {{target_market}}
• Key Features: {{key_features}}
• Competitive Advantages: {{competitive_advantages}}
• Commission Structure: {{commission_details}}

Launch Timeline:
• Partner Training: {{training_date}}
• Marketing Materials Available: {{materials_date}}
• Official Launch: {{launch_date}}
• Early Bird Incentive Period: {{incentive_period}}

Special Launch Incentives:
For the first 30 days, we're offering:
• {{incentive_1}}
• {{incentive_2}}
• {{incentive_3}}

I'd like to schedule a product deep-dive session with you and your team. This will cover:
✓ Product positioning and sales strategies
✓ Underwriting guidelines and requirements
✓ Marketing support and co-op opportunities
✓ Q&A with our product development team

When would be a good time for a 45-minute training session?

Best regards,
{{your_name}}`,
        followUpDays: 4,
        variables: ["partner_name", "new_product_name", "target_market", "key_features", "competitive_advantages", "commission_details", "training_date", "materials_date", "launch_date", "incentive_period", "incentive_1", "incentive_2", "incentive_3", "your_name"]
      }
    ]
  },
  internal: {
    name: "Internal Team Communication & Updates",
    description: "Keep internal teams aligned with policy updates, performance metrics, and strategic initiatives",
    objective: "Maintain clear internal communication and drive organizational alignment and performance",
    emails: [
      {
        id: "email-1",
        subject: "{{department}} Weekly Update - Week of {{week_date}}",
        content: `Team {{department}},

Here's our weekly update for the week of {{week_date}}.

Key Metrics This Week:
• New Policies: {{new_policies}} ({{policies_change}} vs. last week)
• Claims Processed: {{claims_processed}} 
• Customer Satisfaction: {{csat_score}}
• Revenue: {{weekly_revenue}} ({{revenue_change}} vs. target)

Team Highlights:
• {{highlight_1}}
• {{highlight_2}}
• {{highlight_3}}

Challenges & Solutions:
• Challenge: {{challenge_1}}
  Solution: {{solution_1}}
• Challenge: {{challenge_2}}
  Solution: {{solution_2}}

Focus Areas for Next Week:
1. {{focus_area_1}}
2. {{focus_area_2}}
3. {{focus_area_3}}

Upcoming Important Dates:
• {{upcoming_date_1}}: {{event_1}}
• {{upcoming_date_2}}: {{event_2}}

Please reply with any questions or additional items for next week's agenda.

Best regards,
{{sender_name}}
{{title}}`,
        followUpDays: 0,
        variables: ["department", "week_date", "new_policies", "policies_change", "claims_processed", "csat_score", "weekly_revenue", "revenue_change", "highlight_1", "highlight_2", "highlight_3", "challenge_1", "solution_1", "challenge_2", "solution_2", "focus_area_1", "focus_area_2", "focus_area_3", "upcoming_date_1", "event_1", "upcoming_date_2", "event_2", "sender_name", "title"]
      },
      {
        id: "email-2",
        subject: "New policy guidelines effective {{effective_date}}",
        content: `Team,

Please note the following policy updates taking effect on {{effective_date}}.

Policy Changes Summary:
1. {{policy_change_1}}
   • Impact: {{impact_1}}
   • Action Required: {{action_1}}

2. {{policy_change_2}}
   • Impact: {{impact_2}}
   • Action Required: {{action_2}}

3. {{policy_change_3}}
   • Impact: {{impact_3}}
   • Action Required: {{action_3}}

Training & Resources:
• Updated documentation: {{documentation_link}}
• Training session: {{training_details}}
• Q&A session: {{qa_session_details}}

Implementation Checklist:
□ Review updated procedures
□ Update customer communication templates
□ Inform existing clients of relevant changes
□ Complete required training modules

Please confirm receipt of this update and let me know if you have any questions.

Best regards,
{{sender_name}}`,
        followUpDays: 3,
        variables: ["effective_date", "policy_change_1", "impact_1", "action_1", "policy_change_2", "impact_2", "action_2", "policy_change_3", "impact_3", "action_3", "documentation_link", "training_details", "qa_session_details", "sender_name"]
      }
    ]
  }
};

export default function TemplateCreator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    entity_type: '',
    objective: '',
    emails: [],
    status: 'draft',
    category: 'campaign',
    tags: []
  });

  const createMutation = useMutation({
    mutationFn: (data: TemplateFormData) => 
      fetch('/api/campaign-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Template created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/campaign-templates'] });
      setLocation('/campaigns');
    },
    onError: () => {
      toast({ title: "Failed to create template", variant: "destructive" });
    }
  });

  const handleEntityTypeChange = (entityType: string) => {
    const blueprint = templateBlueprints[entityType as keyof typeof templateBlueprints];
    if (blueprint) {
      setFormData({
        ...formData,
        entity_type: entityType,
        name: blueprint.name,
        description: blueprint.description,
        objective: blueprint.objective,
        emails: blueprint.emails
      });
    } else {
      setFormData({
        ...formData,
        entity_type: entityType,
        name: '',
        description: '',
        objective: '',
        emails: []
      });
    }
  };

  const handleSaveTemplate = () => {
    if (!formData.name || !formData.entity_type || !formData.objective) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData);
  };

  const addEmailStep = () => {
    const newEmail: EmailStep = {
      id: `email-${Date.now()}`,
      subject: '',
      content: '',
      followUpDays: 0,
      variables: []
    };
    setFormData({
      ...formData,
      emails: [...formData.emails, newEmail]
    });
  };

  const updateEmailStep = (index: number, field: keyof EmailStep, value: any) => {
    const updatedEmails = [...formData.emails];
    updatedEmails[index] = { ...updatedEmails[index], [field]: value };
    setFormData({ ...formData, emails: updatedEmails });
  };

  const removeEmailStep = (index: number) => {
    const updatedEmails = formData.emails.filter((_, i) => i !== index);
    setFormData({ ...formData, emails: updatedEmails });
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'opportunities': return Target;
      case 'customers': return Users;
      case 'partners': return Building2;
      case 'internal': return Briefcase;
      default: return FileText;
    }
  };

  const getEntityColor = (entityType: string) => {
    switch (entityType) {
      case 'opportunities': return 'text-emerald-600';
      case 'customers': return 'text-blue-600';
      case 'partners': return 'text-violet-600';
      case 'internal': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const steps = [
    { title: "Template Type", description: "Choose your audience and load blueprint" },
    { title: "Template Details", description: "Configure name, description and objective" },
    { title: "Email Sequence", description: "Design your email campaign flow" }
  ];

  const EntityIcon = getEntityIcon(formData.entity_type);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/campaigns')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Create Template</h1>
              <p className="text-sm text-muted-foreground">
                Build reusable email sequences for your campaigns
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Step {currentStep} of {steps.length}</Badge>
          <Button onClick={handleSaveTemplate} disabled={createMutation.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {createMutation.isPending ? 'Creating...' : 'Create Template'}
          </Button>
        </div>
      </div>

      {/* Step Progress */}
      <div className="grid md:grid-cols-3 gap-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          
          return (
            <div
              key={stepNumber}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isActive ? 'bg-blue-50 border-blue-200' : 
                isCompleted ? 'bg-green-50 border-green-200' : 
                'bg-white border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setCurrentStep(stepNumber)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted ? 'bg-green-100 text-green-700' :
                  isActive ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                <div>
                  <div className="font-medium text-sm">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {currentStep === 1 && (
          <>
            {/* Step 1: Template Type Selection */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Choose Template Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(templateBlueprints).map(([type, blueprint]) => {
                      const Icon = getEntityIcon(type);
                      const isSelected = formData.entity_type === type;
                      
                      return (
                        <Card 
                          key={type}
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:border-gray-300'
                          }`}
                          onClick={() => handleEntityTypeChange(type)}
                        >
                          <CardContent className="p-4 text-center space-y-3">
                            <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center ${
                              isSelected ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <Icon className={`h-6 w-6 ${
                                isSelected ? 'text-blue-600' : getEntityColor(type)
                              }`} />
                            </div>
                            <div>
                              <h3 className="font-medium text-sm capitalize">{type}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {blueprint.description.substring(0, 60)}...
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {formData.entity_type && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <EntityIcon className={`h-5 w-5 mt-0.5 ${getEntityColor(formData.entity_type)}`} />
                        <div>
                          <h4 className="font-medium text-sm mb-2">Template Preview</h4>
                          <p className="text-sm text-gray-700 mb-2">{formData.description}</p>
                          <p className="text-xs text-gray-600 mb-3"><strong>Objective:</strong> {formData.objective}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{formData.emails.length} emails</Badge>
                            <Button size="sm" onClick={() => setCurrentStep(2)}>
                              Continue <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            {/* Step 2: Template Details */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Template Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Template Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter template name"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Description *</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the template purpose"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Entity Type *</label>
                    <Select value={formData.entity_type} onValueChange={handleEntityTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opportunities">Opportunities</SelectItem>
                        <SelectItem value="customers">Customers</SelectItem>
                        <SelectItem value="partners">Partners</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Campaign Objective *</label>
                    <Textarea
                      value={formData.objective}
                      onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                      placeholder="Define the campaign goal"
                      rows={3}
                    />
                  </div>

                  <Button onClick={() => setCurrentStep(3)} className="w-full">
                    Continue to Email Sequence <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Template Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.entity_type ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <EntityIcon className={`h-8 w-8 ${getEntityColor(formData.entity_type)}`} />
                        <div>
                          <h3 className="font-medium">{formData.name || 'Untitled Template'}</h3>
                          <p className="text-sm text-gray-600 capitalize">{formData.entity_type} Campaign</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-700">
                        <strong>Objective:</strong> {formData.objective || 'Not specified'}
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Email Sequence ({formData.emails.length} emails)</h4>
                        {formData.emails.map((email, index) => (
                          <div key={email.id} className="flex items-center gap-2 p-2 bg-white border rounded">
                            <Mail className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Email {index + 1}</span>
                            {email.followUpDays > 0 && (
                              <Badge variant="outline" className="text-xs">+{email.followUpDays}d</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Select a template type to see preview
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            {/* Step 3: Email Sequence */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Email Sequence ({formData.emails.length} emails)
                    </CardTitle>
                    <Button onClick={addEmailStep} size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Email
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.emails.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                      <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-4">No emails in this sequence yet</p>
                      <Button onClick={addEmailStep} size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add First Email
                      </Button>
                    </div>
                  ) : (
                    formData.emails.map((email, index) => (
                      <Card key={email.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-blue-600">
                                Email {index + 1}
                              </span>
                              {email.followUpDays > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  +{email.followUpDays} days
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEmailStep(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-2 block">Subject Line</label>
                              <Input
                                value={email.subject}
                                onChange={(e) => updateEmailStep(index, 'subject', e.target.value)}
                                placeholder="Enter email subject"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-2 block">Follow-up Days</label>
                              <Input
                                type="number"
                                value={email.followUpDays}
                                onChange={(e) => updateEmailStep(index, 'followUpDays', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                min="0"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium mb-2 block">Email Content</label>
                            <Textarea
                              value={email.content}
                              onChange={(e) => updateEmailStep(index, 'content', e.target.value)}
                              placeholder="Write your email content here..."
                              rows={8}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}