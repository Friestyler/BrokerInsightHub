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
          <h1 className="text-2xl font-bold text-neutral-800">Broker Copilot</h1>
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
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              <div className="divide-y divide-neutral-200">
                {newsArticles?.slice(0, 10).map((article) => (
                  <div key={article.id} className="flex items-start p-4 hover:bg-neutral-50 transition-colors cursor-pointer">
                    <div className="flex-shrink-0 mr-4">
                      {article.imageUrl ? (
                        <img 
                          src={article.imageUrl} 
                          alt={article.title} 
                          className="h-16 w-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary-100 text-primary-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                            <path d="M18 14h-8" />
                            <path d="M15 18h-5" />
                            <path d="M10 6h8v4h-8V6Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center text-xs text-neutral-500 mb-1">
                        <span className="mr-2">{format(new Date(article.publishedDate), 'MMM dd, yyyy')}</span>
                        <span className="px-2 py-1 rounded-full bg-primary-50 text-primary-600 text-xs">{article.category}</span>
                      </div>
                      <h3 className="font-semibold text-neutral-800 mb-1 line-clamp-1">{article.title}</h3>
                      <p className="text-sm text-neutral-600 line-clamp-2">{article.summary}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Button size="sm" variant="ghost" className="text-primary-600 hover:text-primary-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                        Read
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {newsArticles && newsArticles.length > 10 && (
                <div className="p-4 border-t border-neutral-200 text-center">
                  <Button variant="link" className="text-primary-600 hover:text-primary-700">
                    View All News
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
