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
    queryKey: ['/api/campaign-templates'],
    enabled: false // Disable until backend is ready
  });

  const templateList = templates || [];

  const handleCreateTemplate = () => {
    setLocation('/campaigns/create');
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
          Create New Template
        </Button>
      </div>

      {/* Templates Grid */}
      {templateList.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first email template to start building targeted campaigns for partners, customers, and opportunities.
          </p>
          <Button onClick={handleCreateTemplate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templateList.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  <Badge variant={template.status === 'published' ? 'default' : 'secondary'}>
                    {template.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{template.emailCount} email{template.emailCount !== 1 ? 's' : ''}</span>
                  </div>
                  <p className="text-sm font-medium">{template.objective}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewTemplate(template.id)}
                    className="flex-1 gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEditTemplate(template.id)}
                    className="flex-1 gap-1"
                  >
                    <Settings className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}