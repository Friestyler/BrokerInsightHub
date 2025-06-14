import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplatesPage from './TemplatesPage';
import { FileText, Send } from 'lucide-react';

export default function CampaignsOverview() {
  const [activeTab, setActiveTab] = useState('templates');

  const CampaignsPlaceholder = () => (
    <div className="p-8 text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        <Send className="h-8 w-8 text-gray-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">Active Campaigns</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Manage your live email campaigns, track performance, and monitor recipient engagement.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
        <p className="text-sm text-blue-800">
          Coming soon: Campaign management, analytics, and automation controls
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Campaigns & Templates</h1>
              <p className="text-sm text-muted-foreground">Create email templates and manage active campaigns</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Campaigns
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent value="templates" className="h-full m-0">
            <TemplatesPage />
          </TabsContent>
          <TabsContent value="campaigns" className="h-full m-0">
            <CampaignsPlaceholder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}