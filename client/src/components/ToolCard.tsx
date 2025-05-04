import { ToolCardProps } from "@/lib/types";
import { LucideIcon } from "lucide-react";

import { 
  Newspaper, 
  FileText, 
  PieChart 
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "newspaper": Newspaper,
  "file-text": FileText,
  "pie-chart": PieChart,
};

export default function ToolCard({ 
  icon, 
  title, 
  description, 
  onClick, 
  isSelected 
}: ToolCardProps) {
  const IconComponent = iconMap[icon];
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm p-6 cursor-pointer card-hover ${
        isSelected ? 'border-2 border-primary-500' : 'border-2 border-transparent'
      }`}
      onClick={onClick}
    >
      <div className="h-14 w-14 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
        <IconComponent className="text-primary-600 h-6 w-6" />
      </div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">{title}</h2>
      <p className="text-neutral-600 text-sm">{description}</p>
    </div>
  );
}
