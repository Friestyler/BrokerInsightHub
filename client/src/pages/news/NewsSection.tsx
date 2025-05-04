import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewsItem from "./NewsItem";
import { NewsItemType } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

export default function NewsSection() {
  const [activeCategory, setActiveCategory] = useState("All News");
  
  const { data: newsItems, isLoading, isError, refetch } = useQuery<NewsItemType[]>({
    queryKey: ['/api/news', activeCategory],
    staleTime: 300000, // 5 minutes
  });

  const categories = [
    "All News", 
    "Regulations", 
    "Market Trends", 
    "Products"
  ];

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-neutral-900">Latest Insurance News in Belgium</h2>
        <div className="flex items-center">
          <Button 
            variant="default" 
            onClick={handleRefresh}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh News
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4 border-b mb-6 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              className={`py-3 px-4 text-sm font-medium ${
                activeCategory === category 
                  ? 'tab-active' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-4 py-10 text-center">
            <div className="animate-spin h-8 w-8 mx-auto border-4 border-primary-600 border-t-transparent rounded-full"></div>
            <p className="text-neutral-600">Loading news...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-10">
            <p className="text-destructive">Failed to load news. Please try again.</p>
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : newsItems?.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-neutral-600">No news articles found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {newsItems?.map((item) => (
              <NewsItem key={item.id} item={item} />
            ))}
          </div>
        )}

        {newsItems && newsItems.length > 0 && (
          <div className="mt-6 text-center">
            <button className="text-primary-600 hover:text-primary-800 text-sm font-medium focus:outline-none">
              Load more news 
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 inline ml-1" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
