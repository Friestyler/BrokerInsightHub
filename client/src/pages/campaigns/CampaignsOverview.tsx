import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplatesPage from './TemplatesPage';
import CampaignsList from './CampaignsList';
import { FileText, Send } from 'lucide-react';

export default function CampaignsOverview() {
  const [activeTab, setActiveTab] = useState('templates');

  const CampaignsSection = () => (
    <div className="space-y-6">
      <CampaignsList />
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Templates for Campaigns and Updates</h1>
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