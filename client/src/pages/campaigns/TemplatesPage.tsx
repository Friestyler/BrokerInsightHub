import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Mail, Settings, Eye, Filter, Target, Users, Building2, Briefcase } from "lucide-react";
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

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'opportunities': return { 
        icon: Target, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-100', 
        badge: 'bg-emerald-500 text-white',
        description: 'Sales opportunities and cross-sell campaigns'
      };
      case 'customers': return { 
        icon: Users, 
        color: 'text-blue-600', 
        bg: 'bg-blue-100', 
        badge: 'bg-blue-500 text-white',
        description: 'Client portfolio reviews and updates'
      };
      case 'partners': return { 
        icon: Building2, 
        color: 'text-violet-600', 
        bg: 'bg-violet-100', 
        badge: 'bg-violet-500 text-white',
        description: 'Partner communications and performance updates'
      };
      case 'internal': return { 
        icon: Briefcase, 
        color: 'text-orange-600', 
        bg: 'bg-orange-100', 
        badge: 'bg-orange-500 text-white',
        description: 'Management reports and internal communications'
      };
      default: return { 
        icon: FileText, 
        color: 'text-gray-500', 
        bg: 'bg-gray-50', 
        badge: 'bg-gray-500 text-white',
        description: 'General purpose templates'
      };
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
        <div className="flex items-center gap-4">
          {/* Horizontal Filter Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              {[
                { value: 'all', label: 'All', icon: Filter, color: 'text-gray-600', bg: 'bg-white' },
                { value: 'opportunities', label: 'Opportunities', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { value: 'customers', label: 'Customers', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { value: 'partners', label: 'Partners', icon: Building2, color: 'text-violet-600', bg: 'bg-violet-50' },
                { value: 'internal', label: 'Internal', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' }
              ].map((filter) => {
                const IconComponent = filter.icon;
                const isActive = selectedEntityFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedEntityFilter(filter.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? `${filter.bg} ${filter.color} shadow-sm` 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {filter.label}
                  </button>
                );
              })}
            </div>
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
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {templateList.map((template) => {
            const entityIcon = getEntityTypeIcon(template.entity_type);
            const IconComponent = entityIcon.icon;
            
            return (
              <Card 
                key={template.id} 
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80"
                onClick={() => handleEditTemplate(template.id)}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col items-center text-center space-y-3">
                    {/* Colorful Icon */}
                    <div className={`w-12 h-12 rounded-xl ${entityIcon.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className={`h-6 w-6 ${entityIcon.color}`} />
                    </div>
                    
                    {/* Title */}
                    <h3 className="font-medium text-gray-900 group-hover:text-gray-700 line-clamp-2 text-sm leading-tight">
                      {template.name}
                    </h3>
                    
                    {/* Colorful Entity Type Badge */}
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${entityIcon.badge}`}>
                      {getEntityTypeLabel(template.entity_type)}
                    </div>
                    
                    {/* Small Description */}
                    <p className="text-xs text-gray-500 line-clamp-2 px-1 leading-relaxed">
                      {entityIcon.description}
                    </p>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewTemplate(template.id);
                      }}
                      className="flex-1 h-8 text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTemplate(template.id);
                      }}
                      className="flex-1 h-8 text-xs"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}