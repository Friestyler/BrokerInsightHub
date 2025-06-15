import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Mail, Target, Clock, Plus, X, FileText, Users, Building2, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailStep {
  id: string;
  subject: string;
  content: string;
  followUpDays: number;
  variables: string[];
}

interface CampaignTemplate {
  id: number;
  name: string;
  description: string;
  entity_type: string;
  objective: string;
  emails: EmailStep[];
  status: 'draft' | 'published';
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export default function TemplateEditor() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<CampaignTemplate>>({
    name: '',
    description: '',
    entity_type: '',
    objective: '',
    emails: [],
    status: 'draft',
    category: 'campaign',
    tags: []
  });

  const { data: template, isLoading } = useQuery<CampaignTemplate>({
    queryKey: ['/api/campaign-templates', id],
    queryFn: () => fetch(`/api/campaign-templates/${id}`).then(res => res.json()),
    enabled: !!id
  });

  useEffect(() => {
    if (template) {
      setFormData({
        ...template,
        emails: Array.isArray(template.emails) ? template.emails : []
      });
    }
  }, [template]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CampaignTemplate>) => 
      fetch(`/api/campaign-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Template updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/campaign-templates'] });
    },
    onError: () => {
      toast({ title: "Failed to update template", variant: "destructive" });
    }
  });

  const handleSave = () => {
    updateMutation.mutate(formData);
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
      emails: [...(formData.emails || []), newEmail]
    });
  };

  const updateEmailStep = (index: number, field: keyof EmailStep, value: any) => {
    const updatedEmails = [...(formData.emails || [])];
    updatedEmails[index] = { ...updatedEmails[index], [field]: value };
    setFormData({ ...formData, emails: updatedEmails });
  };

  const removeEmailStep = (index: number) => {
    const updatedEmails = formData.emails?.filter((_, i) => i !== index) || [];
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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Template not found</h3>
          <Button onClick={() => setLocation('/campaigns')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  const EntityIcon = getEntityIcon(formData.entity_type || '');

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
            <div className={`w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center`}>
              <EntityIcon className={`h-5 w-5 ${getEntityColor(formData.entity_type || '')}`} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Edit Template</h1>
              <p className="text-sm text-muted-foreground">
                Modify email sequences and campaign settings
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
            {formData.status}
          </Badge>
          <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Template Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Template Name</label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the template purpose"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Entity Type</label>
                <Select 
                  value={formData.entity_type || ''} 
                  onValueChange={(value) => setFormData({ ...formData, entity_type: value })}
                >
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
                <label className="text-sm font-medium mb-2 block">Campaign Objective</label>
                <Textarea
                  value={formData.objective || ''}
                  onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                  placeholder="Define the campaign goal"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select 
                  value={formData.status || 'draft'} 
                  onValueChange={(value: 'draft' | 'published') => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Sequence */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Sequence ({(formData.emails || []).length} emails)
                </CardTitle>
                <Button onClick={addEmailStep} size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Email
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.emails?.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                  <Mail className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-4">No emails in this sequence yet</p>
                  <Button onClick={addEmailStep} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Email
                  </Button>
                </div>
              ) : (
                formData.emails?.map((email, index) => (
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
                          rows={6}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}