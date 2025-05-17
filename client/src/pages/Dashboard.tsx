import NavigationTiles from "@/components/NavigationTiles";
import { useQuery } from "@tanstack/react-query";
import { NewsArticle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useEnvironment } from "@/contexts/EnvironmentContext";

// New clean Dashboard for My Qollabi environment
function MyQollabiDashboard() {
  return (
    <div className="p-5 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Partner Copilot</h1>
          <p className="text-gray-600 mt-1">Welcome to your collaboration hub. Manage your partners, customers, and opportunities.</p>
        </div>
        
        <NavigationTiles />
        
        {/* More sections to be added in future development */}
      </div>
    </div>
  );
}

// Dashboard for ACME environment - NO news section
function ACMEDashboard() {
  return (
    <div className="p-5 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <p className="text-gray-600 mt-1 text-sm">Access intelligent tools to enhance your brokerage efficiency</p>
        </div>
        
        <NavigationTiles />
        
        {/* Latest Insurance News section removed for ACME environment */}
      </div>
    </div>
  );
}

// Archive of the original My Qollabi dashboard - moved to Globex Corp
function GlobexDashboard() {
  const { data: newsArticles, isLoading, refetch } = useQuery({
    queryKey: ['/api/news'],
    queryFn: async () => {
      const response = await fetch('/api/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news articles');
      }
      return response.json() as Promise<NewsArticle[]>;
    }
  });
  
  const handleRefresh = () => {
    refetch();
  };
  
  return (
    <div className="p-5 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <p className="text-gray-600 mt-1 text-sm">Access intelligent tools to enhance your brokerage efficiency</p>
        </div>
        
        <NavigationTiles />
        
        {/* News section */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Latest Insurance News</h2>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex items-center gap-1 text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                asChild
              >
                <a href="/news">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  </svg>
                  Smart Search
                </a>
              </Button>
              <Button size="sm" onClick={handleRefresh} variant="outline" className="flex items-center gap-1 border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
                Refresh
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <div className="divide-y divide-gray-100">
                {newsArticles?.slice(0, 10).map((article) => (
                  <div key={article.id} className="flex items-start p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex-shrink-0 mr-4">
                      {article.imageUrl ? (
                        <img 
                          src={article.imageUrl} 
                          alt={article.title} 
                          className="h-14 w-14 object-cover rounded-md"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-14 w-14 rounded-md bg-indigo-50 text-indigo-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                            <path d="M18 14h-8" />
                            <path d="M15 18h-5" />
                            <path d="M10 6h8v4h-8V6Z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <span className="mr-2">{format(new Date(article.publishedDate), 'MMM dd, yyyy')}</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs">{article.category}</span>
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{article.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{article.summary}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
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
                <div className="p-4 border-t border-gray-100 text-center">
                  <Button variant="link" className="text-indigo-600 hover:text-indigo-700">
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

// Main Dashboard component that selects the appropriate dashboard based on environment
export default function Dashboard() {
  const { environment } = useEnvironment();
  
  // Render the appropriate dashboard based on environment
  if (environment.id === 'acme') {
    return <ACMEDashboard />;
  } else if (environment.id === 'globex') {
    return <GlobexDashboard />;
  }
  
  // Default to My Qollabi dashboard
  return <MyQollabiDashboard />;
}
