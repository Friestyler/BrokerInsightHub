import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Mail, Settings, Eye, Filter } from "lucide-react";
import { useLocation } from 'wouter';

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

export default function TemplatesPage() {
  const [, setLocation] = useLocation();
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('all');
  
  const { data: templates, isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/campaign-templates', selectedEntityFilter],
    queryFn: () => {
      const url = selectedEntityFilter === 'all' 
        ? '/api/campaign-templates' 
        : `/api/campaign-templates?entity_type=${selectedEntityFilter}`;
      return fetch(url).then(res => res.json());
    }
  });

  const templateList = templates || [];

  const handleCreateTemplate = () => {
    setLocation('/campaigns/create');
  };

  const handleEditTemplate = (templateId: number) => {
    setLocation(`/campaigns/templates/${templateId}/edit`);
  };

  const handlePreviewTemplate = (templateId: number) => {
    setLocation(`/campaigns/templates/${templateId}/preview`);
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'opportunities': return 'bg-green-100 text-green-800';
      case 'customers': return 'bg-blue-100 text-blue-800';
      case 'partners': return 'bg-purple-100 text-purple-800';
      case 'internal': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityTypeLabel = (entityType: string) => {
    switch (entityType) {
      case 'opportunities': return 'Opportunities';
      case 'customers': return 'Customers';
      case 'partners': return 'Partners';
      case 'internal': return 'Internal';
      default: return entityType;
    }
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
          <h1 className="text-2xl font-semibold tracking-tight">Templates for Campaigns and Updates</h1>
          <p className="text-sm text-muted-foreground">
            Create reusable email sequences and campaign blueprints
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedEntityFilter} onValueChange={setSelectedEntityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="opportunities">Opportunities</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
                <SelectItem value="partners">Partners</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreateTemplate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Template
          </Button>
        </div>
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
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getEntityTypeColor(template.entity_type)}>
                      {getEntityTypeLabel(template.entity_type)}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{template.emails?.length || 0} email{(template.emails?.length || 0) !== 1 ? 's' : ''}</span>
                    </div>
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