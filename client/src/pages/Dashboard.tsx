import NavigationTiles from "@/components/NavigationTiles";
import { useQuery } from "@tanstack/react-query";
import { NewsArticle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: newsArticles, isLoading } = useQuery({
    queryKey: ['/api/news'],
    queryFn: async () => {
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news articles');
      }
      return response.json() as Promise<NewsArticle[]>;
    }
  });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-800">My Broker AI Tools</h1>
          <p className="text-neutral-600 mt-1">Access intelligent tools to enhance your brokerage efficiency</p>
        </div>
        
        <NavigationTiles />
        
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-neutral-800 mb-6">Latest Insurance News</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsArticles?.slice(0, 6).map((article) => (
                <div key={article.id} className="border border-neutral-200 rounded-lg overflow-hidden transition-shadow hover:shadow-md">
                  <div className="h-40 bg-neutral-100 flex items-center justify-center overflow-hidden">
                    {article.imageUrl ? (
                      <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                          <path d="M18 14h-8" />
                          <path d="M15 18h-5" />
                          <path d="M10 6h8v4h-8V6Z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center text-xs text-neutral-500 mb-2">
                      <span className="mr-2">{format(new Date(article.publishedDate), 'MMM dd, yyyy')}</span>
                      <span className="px-2 py-1 rounded-full bg-primary-50 text-primary-600">{article.category}</span>
                    </div>
                    <h3 className="font-semibold text-neutral-800 mb-2 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-neutral-600 mb-3 line-clamp-3">{article.content}</p>
                    <Button variant="outline" size="sm" className="w-full">Read More</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
