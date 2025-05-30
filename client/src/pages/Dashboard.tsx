import NavigationTiles from "@/components/NavigationTiles";
import { useQuery } from "@tanstack/react-query";
import { NewsArticle } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useEnvironment } from "@/contexts/EnvironmentContext";

// New Partner Copilot Dashboard for My Qollabi environment
function MyQollabiDashboard() {
  return (
    <div className="p-5 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Partner Copilot</h1>
          <p className="text-gray-600 mt-1">Welcome to your collaboration hub. Manage your partners, customers, and opportunities.</p>
        </div>
        
        {/* Central inbox section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 10h10" />
              <path d="M7 14h8" />
              <path d="M7 18h6" />
            </svg>
            Central Inbox
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Shared Updates */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-shadow p-5">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Shared Updates</h3>
              </div>
              <p className="text-gray-600 mb-4">View recent shared documents and collaborative activities.</p>
              <div className="text-indigo-600 font-medium text-sm cursor-pointer hover:text-indigo-700">
                View all updates →
              </div>
            </div>
            
            {/* Mentions */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-shadow p-5">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Mentions</h3>
              </div>
              <p className="text-gray-600 mb-4">Check notifications where you've been mentioned by colleagues.</p>
              <div className="text-indigo-600 font-medium text-sm cursor-pointer hover:text-indigo-700">
                View all mentions →
              </div>
            </div>
            
            {/* Campaign Invites */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-shadow p-5">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13"></path>
                    <path d="M22 2L15 22 11 13 2 9 22 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Campaign Invites</h3>
              </div>
              <p className="text-gray-600 mb-4">Respond to new campaign invitations from your partners.</p>
              <div className="text-indigo-600 font-medium text-sm cursor-pointer hover:text-indigo-700">
                View all invites →
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
              <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path>
              <path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"></path>
              <path d="M15 2v5h5"></path>
            </svg>
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex flex-col items-center bg-white border border-gray-200 rounded-lg p-4 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mb-2">
                <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
              </svg>
              <span className="text-gray-800 font-medium">New Customer</span>
            </button>
            
            <button className="flex flex-col items-center bg-white border border-gray-200 rounded-lg p-4 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mb-2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              <span className="text-gray-800 font-medium">New Opportunity</span>
            </button>
            
            <button className="flex flex-col items-center bg-white border border-gray-200 rounded-lg p-4 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mb-2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span className="text-gray-800 font-medium">New Partner</span>
            </button>
            
            <button className="flex flex-col items-center bg-white border border-gray-200 rounded-lg p-4 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 mb-2">
                <path d="M22 2L11 13"></path>
                <path d="M22 2L15 22 11 13 2 9 22 2z"></path>
              </svg>
              <span className="text-gray-800 font-medium">New Campaign</span>
            </button>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Recent Activity
          </h2>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              <div className="flex items-center p-4 hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">New opportunity created</p>
                  <p className="text-gray-500 text-sm">Home insurance cross-sell for ABC Corp</p>
                </div>
                <div className="text-gray-400 text-sm">2 hours ago</div>
              </div>
              
              <div className="flex items-center p-4 hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.48-8.48l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">Document shared</p>
                  <p className="text-gray-500 text-sm">Policy review for XYZ Manufacturing</p>
                </div>
                <div className="text-gray-400 text-sm">Yesterday</div>
              </div>
              
              <div className="flex items-center p-4 hover:bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">Campaign completed</p>
                  <p className="text-gray-500 text-sm">Q2 Commercial Insurance outreach</p>
                </div>
                <div className="text-gray-400 text-sm">2 days ago</div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 text-center">
              <button className="text-indigo-600 font-medium hover:text-indigo-700">
                View all activity
              </button>
            </div>
          </div>
        </div>
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
    staleTime: 2 * 60 * 1000,
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
