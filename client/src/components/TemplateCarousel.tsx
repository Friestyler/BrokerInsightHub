import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { FileSpreadsheet, Calendar, Users, Eye, Trash2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

interface UploadTemplate {
  id: number;
  name: string;
  description?: string;
  entityType: string;
  environmentId: string;
  columnMappings: any;
  isShared: boolean;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TemplateCarouselProps {
  templates: any[];
  onSelectTemplate: (templateId: string) => void;
  entityType: string;
  environmentId: string;
}

export function TemplateCarousel({ templates, onSelectTemplate, entityType, environmentId }: TemplateCarouselProps) {
  const [, setLocation] = useLocation();

  const useTemplate = (template: UploadTemplate) => {
    onSelectTemplate(template.id.toString());
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'opportunities':
        return <FileSpreadsheet className="h-5 w-5 text-blue-600" />;
      case 'partners':
        return <Users className="h-5 w-5 text-green-600" />;
      case 'customers':
        return <Users className="h-5 w-5 text-purple-600" />;
      default:
        return <FileSpreadsheet className="h-5 w-5 text-gray-600" />;
    }
  };

  const getEntityColor = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'opportunities':
        return 'border-blue-200 bg-blue-50';
      case 'partners':
        return 'border-green-200 bg-green-50';
      case 'customers':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  if (!templates || templates.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Available Templates</h3>
        <Card className="border-dashed border-2 border-[#E6E7F1]">
          <CardContent className="p-6 text-center">
            <FileSpreadsheet className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              No templates available for this entity type
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Available Templates</h3>
        <Badge variant="secondary">{templates.length} templates</Badge>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4">
          {templates.slice(0, 10).map((template) => (
            <Card 
              key={template.id} 
              className={`w-80 hover:shadow-md transition-shadow cursor-pointer ${getEntityColor(template.entityType)}`}
              onClick={() => useTemplate(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                      {getEntityIcon(template.entityType)}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {template.entityType}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      useTemplate(template);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {template.description && (
                  <CardDescription className="text-sm mb-3 line-clamp-2">
                    {template.description}
                  </CardDescription>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{template.usageCount || 0} uses</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {template.lastUsedAt 
                          ? formatDistanceToNow(new Date(template.lastUsedAt), { addSuffix: true })
                          : 'Never used'
                        }
                      </span>
                    </div>
                  </div>
                  {template.isShared && (
                    <Badge variant="secondary" className="text-xs">
                      Shared
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}