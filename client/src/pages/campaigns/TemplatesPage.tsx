import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Mail, Settings, Eye } from "lucide-react";
import { useLocation } from 'wouter';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  objective: string;
  emailCount: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export default function TemplatesPage() {
  const [, setLocation] = useLocation();
  
  const { data: templates, isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/campaign-templates']
  });

  const templateList = templates || [];

  const handleCreateTemplate = () => {
    setLocation('/campaigns/templates/create');
  };

  const handleEditTemplate = (templateId: string) => {
    setLocation(`/campaigns/templates/${templateId}/edit`);
  };

  const handlePreviewTemplate = (templateId: string) => {
    setLocation(`/campaigns/templates/${templateId}/preview`);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Email Templates</h1>
            <p className="text-sm text-muted-foreground">Create reusable email sequences and campaign blueprints</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Email Templates</h1>
          <p className="text-sm text-muted-foreground">
            Create reusable email sequences and campaign blueprints
          </p>
        </div>
        <Button onClick={handleCreateTemplate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templateList.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">No templates yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Create your first email template to get started with campaign building
              </p>
            </div>
            <Button onClick={handleCreateTemplate} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templateList.map((template: EmailTemplate) => (
            <Card key={template.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  <Badge 
                    variant={template.status === 'published' ? 'default' : 'secondary'}
                    className="ml-2 shrink-0"
                  >
                    {template.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{template.emailCount} emails in sequence</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Objective:</span>
                    <p className="text-muted-foreground mt-1">{template.objective}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Updated {new Date(template.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreviewTemplate(template.id)}
                      className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTemplate(template.id)}
                      className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Settings className="h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}