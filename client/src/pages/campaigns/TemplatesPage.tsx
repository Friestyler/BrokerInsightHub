import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Mail, Settings, Eye, Target, Users, Send, Briefcase, Check, Heart, Star, Zap, Globe, Shield, Trophy, Clock, Calendar, Building2, Phone, MessageSquare, Gift, TrendingUp, Lightbulb, Settings as SettingsIcon } from "lucide-react";
import { useLocation } from 'wouter';

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  objective: string;
  entity: string;
  icon: string;
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

  // Get template's custom icon
  const getTemplateIcon = (iconName: string) => {
    const iconProps = { className: "h-6 w-6" };
    switch (iconName) {
      case 'settings': return <SettingsIcon {...iconProps} />;
      case 'trending-up': return <TrendingUp {...iconProps} />;
      case 'zap': return <Zap {...iconProps} />;
      case 'star': return <Star {...iconProps} />;
      case 'heart': return <Heart {...iconProps} />;
      case 'gift': return <Gift {...iconProps} />;
      case 'mail': return <Mail {...iconProps} />;
      case 'sparkles': return <Star {...iconProps} />;
      case 'target': return <Target {...iconProps} />;
      case 'users': return <Users {...iconProps} />;
      case 'send': return <Send {...iconProps} />;
      case 'briefcase': return <Briefcase {...iconProps} />;
      case 'globe': return <Globe {...iconProps} />;
      case 'shield': return <Shield {...iconProps} />;
      case 'trophy': return <Trophy {...iconProps} />;
      case 'clock': return <Clock {...iconProps} />;
      case 'calendar': return <Calendar {...iconProps} />;
      case 'building2': return <Building2 {...iconProps} />;
      case 'phone': return <Phone {...iconProps} />;
      case 'message-square': return <MessageSquare {...iconProps} />;
      case 'lightbulb': return <Lightbulb {...iconProps} />;
      default: return <FileText {...iconProps} />;
    }
  };

  // Get icon color based on icon type (matching the exact database mapping from CampaignCreator)
  const getIconColor = (iconName: string) => {
    switch (iconName) {
      case 'target': return 'bg-blue-500';
      case 'trending-up': return 'bg-green-500';  
      case 'zap': return 'bg-yellow-500';
      case 'star': return 'bg-purple-500';
      case 'heart': return 'bg-pink-500';
      case 'gift': return 'bg-red-500';
      case 'mail': return 'bg-gray-500';
      case 'rocket': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  // Get entity colors and styling
  const getEntityConfig = (entity: string) => {
    switch (entity) {
      case 'opportunities':
        return {
          bgColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
          borderColor: 'border-green-200 hover:border-green-300',
          textColor: 'text-green-900',
          badgeColor: 'bg-green-100 text-green-800',
          label: 'Opportunities'
        };
      case 'customers':
        return {
          bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          borderColor: 'border-blue-200 hover:border-blue-300',
          textColor: 'text-blue-900',
          badgeColor: 'bg-blue-100 text-blue-800',
          label: 'Customers'
        };
      case 'partners':
        return {
          bgColor: 'bg-gradient-to-br from-purple-500 to-violet-600',
          borderColor: 'border-purple-200 hover:border-purple-300',
          textColor: 'text-purple-900',
          badgeColor: 'bg-purple-100 text-purple-800',
          label: 'Partners'
        };
      case 'internal':
        return {
          bgColor: 'bg-gradient-to-br from-orange-500 to-red-600',
          borderColor: 'border-orange-200 hover:border-orange-300',
          textColor: 'text-orange-900',
          badgeColor: 'bg-orange-100 text-orange-800',
          label: 'Internal'
        };
      default:
        return {
          bgColor: 'bg-gradient-to-br from-gray-500 to-gray-600',
          borderColor: 'border-gray-200 hover:border-gray-300',
          textColor: 'text-gray-900',
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
                className="bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-200 hover:shadow-md group"
              >
                {/* Entity Type Tag */}
                <div className="flex justify-start items-start mb-4">
                  <Badge className={`text-xs font-medium ${entityConfig.badgeColor}`}>
                    {entityConfig.label}
                  </Badge>
                </div>

                {/* Template Custom Icon */}
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-105 ${getIconColor(template.icon)}`}>
                    {getTemplateIcon(template.icon)}
                  </div>
                </div>
                
                {/* Template Info */}
                <div className="text-center space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg leading-tight text-gray-900 line-clamp-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                      {template.description}
                    </p>
                  </div>
                  
                  {/* Email count and buttons in same area */}
                  <div className="flex items-center justify-between mt-auto pt-3">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail className="h-3 w-3" />
                      <span>{template.emailCount}</span>
                    </div>
                    
                    {/* Action Buttons - Only visible on hover */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewTemplate(template.id)}
                        className="text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template.id)}
                        className="text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-1"
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}