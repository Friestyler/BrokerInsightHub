import { NewsItemType } from "@/lib/types";
import { format } from "date-fns";

interface NewsItemProps {
  item: NewsItemType;
}

export default function NewsItem({ item }: NewsItemProps) {
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50">
      <div className="flex">
        <div className="flex-shrink-0 h-20 w-20 bg-neutral-200 rounded overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt="News illustration" 
            className="h-full w-full object-cover"
          />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-base font-medium text-neutral-900">{item.title}</h3>
          <p className="mt-1 text-sm text-neutral-600 line-clamp-2">{item.summary}</p>
          <div className="mt-2 flex items-center text-xs text-neutral-500">
            <span>{formatDate(item.publishedDate)}</span>
            <span className="mx-2">•</span>
            <span>{item.source}</span>
            <span className="mx-2">•</span>
            <span className="text-primary-600 hover:text-primary-800 cursor-pointer">Read more</span>
          </div>
        </div>
      </div>
    </div>
  );
}
