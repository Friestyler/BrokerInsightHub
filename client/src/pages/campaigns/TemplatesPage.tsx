import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Mail, Settings, Eye, Target, Users, Send, Briefcase, Check } from "lucide-react";
import { useLocation } from 'wouter';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  objective: string;
  entity: string;
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
    setLocation('/campaigns/create');
  };

  const handleEditTemplate = (templateId: string) => {
    setLocation(`/campaigns/create-template?edit=${templateId}`);
  };

  const handlePreviewTemplate = (templateId: string) => {
    setLocation(`/campaigns/create?preview=${templateId}`);
  };

  // Get entity icon and colors
  const getEntityConfig = (entity: string) => {
    switch (entity) {
      case 'opportunities':
        return {
          icon: <Target className="h-6 w-6" />,
          bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
          borderColor: 'border-green-200 hover:border-green-300',
          textColor: 'text-green-900',
          subtitleColor: 'text-green-600',
          badgeColor: 'bg-green-100 text-green-800',
          label: 'Opportunities'
        };
      case 'customers':
        return {
          icon: <Users className="h-6 w-6" />,
          bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          borderColor: 'border-blue-200 hover:border-blue-300',
          textColor: 'text-blue-900',
          subtitleColor: 'text-blue-600',
          badgeColor: 'bg-blue-100 text-blue-800',
          label: 'Customers'
        };
      case 'partners':
        return {
          icon: <Send className="h-6 w-6" />,
          bgColor: 'bg-gradient-to-br from-purple-500 to-violet-600',
          borderColor: 'border-purple-200 hover:border-purple-300',
          textColor: 'text-purple-900',
          subtitleColor: 'text-purple-600',
          badgeColor: 'bg-purple-100 text-purple-800',
          label: 'Partners'
        };
      case 'internal':
        return {
          icon: <Briefcase className="h-6 w-6" />,
          bgColor: 'bg-gradient-to-br from-orange-500 to-red-600',
          borderColor: 'border-orange-200 hover:border-orange-300',
          textColor: 'text-orange-900',
          subtitleColor: 'text-orange-600',
          badgeColor: 'bg-orange-100 text-orange-800',
          label: 'Internal'
        };
      default:
        return {
          icon: <FileText className="h-6 w-6" />,
          bgColor: 'bg-gradient-to-br from-gray-500 to-gray-600',
          borderColor: 'border-gray-200 hover:border-gray-300',
          textColor: 'text-gray-900',
          subtitleColor: 'text-gray-600',
          badgeColor: 'bg-gray-100 text-gray-800',
          label: 'Template'
        };
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templateList.map((template) => {
            const entityConfig = getEntityConfig(template.entity);
            
            return (
              <div
                key={template.id}
                className={`relative bg-white rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group ${entityConfig.borderColor}`}
              >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <Badge 
                    variant={template.status === 'published' ? 'default' : 'secondary'}
                    className={`text-xs font-medium ${template.status === 'published' ? entityConfig.badgeColor : 'bg-gray-100 text-gray-600'}`}
                  >
                    {template.status}
                  </Badge>
                </div>

                {/* Entity Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white transition-all duration-300 group-hover:scale-110 ${entityConfig.bgColor}`}>
                  {entityConfig.icon}
                </div>

                {/* Content */}
                <div className="space-y-3 mb-6">
                  <div className="space-y-1">
                    <h3 className={`font-semibold text-lg leading-tight transition-colors duration-300 ${entityConfig.textColor}`}>
                      {template.name}
                    </h3>
                    <p className={`text-sm font-medium ${entityConfig.subtitleColor}`}>
                      {entityConfig.label}
                    </p>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail className="h-3 w-3" />
                    <span>{template.emailCount} email{template.emailCount !== 1 ? 's' : ''}</span>
                  </div>
                  
                  <p className="text-xs text-gray-500 font-medium">
                    {template.objective}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewTemplate(template.id)}
                    className="flex-1 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEditTemplate(template.id)}
                    className={`flex-1 text-xs text-white border-0 ${entityConfig.bgColor} hover:opacity-90`}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}