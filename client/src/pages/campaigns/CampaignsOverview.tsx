import TemplatesPage from './TemplatesPage';
import { FileText } from 'lucide-react';

export default function CampaignsOverview() {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex space-x-2">
            <button
              className="bg-[#E1E4FB] text-[#3E4DC4] py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Templates
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-white">
        <TemplatesPage />
      </div>
    </div>
  );
}