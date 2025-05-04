import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ToolHeader from "@/components/ToolHeader";
import { type NewsArticle } from "@shared/schema";
import { format } from "date-fns";

export default function InsuranceNews() {
  const [filter, setFilter] = useState("all");

  const { data: newsArticles, isLoading, refetch } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news'],
  });

  const filteredArticles = filter === "all" 
    ? newsArticles 
    : newsArticles?.filter(article => article.category.toLowerCase() === filter.toLowerCase());

  const handleRefresh = () => {
    refetch();
  };

  const renderNewsItems = () => {
    if (isLoading) {
      return Array(4).fill(0).map((_, i) => (
        <Card key={i} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <Skeleton className="w-full h-48" />
          <CardContent className="p-4">
            <div className="flex items-center text-xs text-neutral-500 mb-2">
              <Skeleton className="h-5 w-20 mr-2" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-3/4 mb-3" />
            <Skeleton className="h-5 w-24" />
          </CardContent>
        </Card>
      ));
    }

    if (!newsArticles || newsArticles.length === 0) {
      return (
        <div className="col-span-full text-center py-10">
          <p className="text-neutral-600">No news articles available at the moment.</p>
        </div>
      );
    }

    return filteredArticles?.map(article => (
      <Card key={article.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center text-xs text-neutral-500 mb-2">
            <Badge variant="outline" className={`mr-2 ${
              article.category === "Regulation" ? "bg-primary-100 text-primary-700" : 
              "bg-neutral-100 text-neutral-700"
            }`}>
              {article.category}
            </Badge>
            <span>{format(new Date(article.publishedDate), 'MMM d, yyyy')}</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
          <p className="text-neutral-600 text-sm mb-3">{article.summary}</p>
          <Button variant="link" className="p-0 h-auto text-primary-600 hover:text-primary-700 text-sm font-medium">
            Read more →
          </Button>
        </CardContent>
      </Card>
    ));
  };

  const headerActions = (
    <>
      <Button variant="outline" size="sm" className="text-neutral-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
        Filter
      </Button>
      <Button size="sm" onClick={handleRefresh}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
        Refresh
      </Button>
    </>
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white rounded-xl p-6 border border-neutral-200">
          <ToolHeader 
            title="Latest Insurance News in Belgium" 
            actions={headerActions}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderNewsItems()}
          </div>
          
          {newsArticles && newsArticles.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" className="border-primary-300 text-primary-600 hover:bg-primary-50">
                Load more news
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
