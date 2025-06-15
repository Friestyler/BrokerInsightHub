import { useState } from 'react';
import { Button } from "@/components/ui/button";
import TemplatesPage from './TemplatesPage';
import CampaignsPage from './CampaignsPage';
import { FileText, Send } from 'lucide-react';

export default function CampaignsOverview() {
  const [activeTab, setActiveTab] = useState('campaigns');

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 ${
                activeTab === 'campaigns' 
                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('campaigns')}
            >
              <Send className="h-4 w-4" />
              Campaigns
            </Button>
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 ${
                activeTab === 'templates' 
                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('templates')}
            >
              <FileText className="h-4 w-4" />
              Templates
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        {activeTab === 'campaigns' && <CampaignsPage />}
        {activeTab === 'templates' && <TemplatesPage />}
      </div>
    </div>
  );
}