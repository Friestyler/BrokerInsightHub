import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Mail, Settings, Eye, Target, Users, Send, Briefcase, Check, Heart, Star, Zap, Globe, Shield, Trophy, Clock, Calendar, Building2, Phone, MessageSquare, Gift, TrendingUp, Lightbulb, Settings as SettingsIcon, Rocket, Car, Sun, Building } from "lucide-react";
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
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  
  const { data: templates, isLoading } = useQuery<EmailTemplate[]>({
    queryKey: ['/api/campaign-templates']
  });

  const allTemplates = templates || [];
  
  // Function to determine category based on template name
  const getCategoryFromName = (name: string): string => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('motor + legal gap') || 
        lowerName.includes('professional liability upgrade') || 
        lowerName.includes('solar panel protection')) {
      return 'coverage-gap';
    }
    
    if (lowerName.includes('annual policy review')) {
      return 'retention';
    }
    
    if (lowerName.includes('industry-specific proposition')) {
      return 'segment-specific';
    }
    
    return 'other';
  };
  
  // Filter templates based on selected entity type and category
  let templateList = selectedEntityFilter === 'all' 
    ? allTemplates 
    : allTemplates.filter(template => template.entity === selectedEntityFilter);
    
  // Apply category filter
  if (selectedCategoryFilter !== 'all') {
    templateList = templateList.filter(template => 
      getCategoryFromName(template.name) === selectedCategoryFilter
    );
  }

  // Get unique entity types from templates for filter options
  const entityMap: { [key: string]: boolean } = {};
  allTemplates.forEach(template => {
    entityMap[template.entity] = true;
  });
  const uniqueEntities = Object.keys(entityMap);
  const entityTypes = ['all', ...uniqueEntities];

  const handleCreateTemplate = () => {
    setLocation('/campaigns/create-template');
  };

  const handleEditTemplate = (templateId: string) => {
    setLocation(`/campaigns/create-template?edit=${templateId}`);
  };

  const handleCreateCampaign = (templateId: string) => {
    setLocation(`/campaigns/create-from-template/${templateId}`);
  };

  const handleUseTemplate = (templateId: string) => {
    setLocation(`/campaigns/create?template=${templateId}`);
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
      case 'building': return <Building {...iconProps} />;
      case 'phone': return <Phone {...iconProps} />;
      case 'message-square': return <MessageSquare {...iconProps} />;
      case 'lightbulb': return <Lightbulb {...iconProps} />;
      case 'car': return <Car {...iconProps} />;
      case 'sun': return <Sun {...iconProps} />;
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
      case 'car': return 'bg-blue-600';
      case 'briefcase': return 'bg-purple-600';
      case 'sun': return 'bg-orange-500';
      case 'calendar': return 'bg-green-600';
      case 'building': return 'bg-indigo-600';
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
          <h1 className="text-2xl font-semibold tracking-tight">Templates for Campaigns & Updates</h1>
          <p className="text-sm text-muted-foreground">
            Create reusable email sequences and campaign blueprints
          </p>
        </div>
        <Button onClick={handleCreateTemplate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Template
        </Button>
      </div>
      {/* Category Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1">
          {[
            { id: 'all', label: 'All Templates', icon: Globe },
            { id: 'coverage-gap', label: 'Coverage Gap Closers', icon: Shield },
            { id: 'retention', label: 'Retention & Relationship Builders', icon: Heart },
            { id: 'segment-specific', label: 'Segment-Specific Propositions', icon: Target }
          ].map((category) => {
            const isActive = selectedCategoryFilter === category.id;
            const IconComponent = category.icon;
            
            return (
              <Button
                key={category.id}
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedCategoryFilter(category.id)}
              >
                <IconComponent className="h-3 w-3" />
                {category.label}
              </Button>
            );
          })}
        </div>
        
        {/* Entity Filter */}
        <div className="flex flex-wrap gap-1">
          {entityTypes.map((entityType) => {
            const isActive = selectedEntityFilter === entityType;
            const entityConfig = getEntityConfig(entityType);
            
            return (
              <Button
                key={entityType}
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedEntityFilter(entityType)}
              >
                {entityType === 'all' ? (
                  <>
                    <Globe className="h-3 w-3" />
                    All Templates
                  </>
                ) : (
                  <>
                    {entityType === 'opportunities' && <Target className="h-3 w-3" />}
                    {entityType === 'customers' && <Users className="h-3 w-3" />}
                    {entityType === 'partners' && <Briefcase className="h-3 w-3" />}
                    {entityType === 'internal' && <Building2 className="h-3 w-3" />}
                    {entityConfig.label}
                  </>
                )}
              </Button>
            );
          })}
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {templateList.map((template) => {
            const entityConfig = getEntityConfig(template.entity);
            
            return (
              <div
                key={template.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 transition-all duration-200 hover:shadow-md group"
              >
                {/* Entity Type Tag */}
                <div className="flex justify-start items-start mb-3">
                  <Badge className={`text-xs font-medium ${entityConfig.badgeColor}`}>
                    {entityConfig.label}
                  </Badge>
                </div>

                {/* Template Custom Icon */}
                <div className="flex justify-center mb-2">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white transition-transform duration-200 group-hover:scale-105 ${getIconColor(template.icon)}`}>
                    <div className="text-lg">
                      {getTemplateIcon(template.icon)}
                    </div>
                  </div>
                </div>
                
                {/* Template Info */}
                <div className="text-center space-y-1 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base leading-tight text-gray-900 line-clamp-2">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-snug">
                      {template.description}
                    </p>
                  </div>
                  
                  {/* Email count centered */}
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-2">
                    <Mail className="h-3 w-3" />
                    <span>{template.emailCount}</span>
                  </div>
                  
                  {/* Action Buttons - Only visible on hover */}
                  <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCreateCampaign(template.id)}
                      className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1"
                    >
                      <Rocket className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTemplate(template.id)}
                      className="text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-1"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
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