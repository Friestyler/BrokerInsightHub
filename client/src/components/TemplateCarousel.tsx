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

export function TemplateCarousel() {
  const [, setLocation] = useLocation();
  const environmentId = 'degoudse';

  // Fetch all templates
  const { data: templates = [], isLoading } = useQuery<UploadTemplate[]>({
    queryKey: ['/api', environmentId, 'upload', 'templates'],
  });

  const useTemplate = (template: UploadTemplate) => {
    // Navigate to upload process with template preloaded
    setLocation(`/data-upload-2/process/${template.entityType}?templateId=${template.id}`);
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
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
    switch (entityType.toLowerCase()) {
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

  if (isLoading) {
    return (
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Recent Templates</h2>
        <div className="flex space-x-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-80 h-40 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Recent Templates</h2>
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-600">
              Create your first template by uploading data and saving your column mappings
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recent Templates</h2>
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
                      <CardTitle className="text-base font-medium">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {template.entityType}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs">{template.usageCount}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm mb-3 line-clamp-2">
                  {template.description || 'No description provided'}
                </CardDescription>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {template.lastUsedAt 
                        ? `Used ${formatDistanceToNow(new Date(template.lastUsedAt))} ago`
                        : `Created ${formatDistanceToNow(new Date(template.createdAt))} ago`
                      }
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileSpreadsheet className="h-3 w-3" />
                    <span>{Object.keys(template.columnMappings || {}).length} mappings</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-3" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    useTemplate(template);
                  }}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}