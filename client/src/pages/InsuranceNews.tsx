import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import ToolHeader from "@/components/ToolHeader";
import { type NewsArticle } from "@shared/schema";
import { format } from "date-fns";

// Smart categories for news filtering
const CATEGORIES = [
  { id: "all", label: "All News", icon: "📰" },
  { id: "policy", label: "Policy Updates", icon: "📋" },
  { id: "regulatory", label: "Regulatory Changes", icon: "⚖️" },
  { id: "market", label: "Market Trends", icon: "📈" },
  { id: "events", label: "Industry Events", icon: "🗓️" },
  { id: "technology", label: "Tech & Innovation", icon: "💻" },
  { id: "broker", label: "Broker News", icon: "🤝" },
  { id: "climate", label: "Climate Risk", icon: "🌍" },
  { id: "cyber", label: "Cyber Insurance", icon: "🛡️" },
];

export default function InsuranceNews() {
  const [filter, setFilter] = useState("all");
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const { data: newsArticles, isLoading, refetch } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news'],
  });

  const filteredArticles = filter === "all" 
    ? newsArticles 
    : newsArticles?.filter(article => article.category.toLowerCase() === filter.toLowerCase());

  const handleRefresh = () => {
    refetch();
  };

  const handleOpenSearchPanel = () => {
    setIsSearchPanelOpen(true);
  };

  const handleCloseSearchPanel = () => {
    setIsSearchPanelOpen(false);
  };

  const handleSearch = (searchQuery: string) => {
    setCurrentSearch(searchQuery);
    setShowSearchResults(true);
  };

  const handleCloseSearchResults = () => {
    setShowSearchResults(false);
  };

  const renderNewsItems = () => {
    if (isLoading) {
      return (
        <div className="col-span-full">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="mb-3 border-b border-neutral-200 pb-3 last:border-0">
              <div className="flex items-start">
                <Skeleton className="h-16 w-16 rounded-md mr-4 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center text-xs text-neutral-500 mb-1">
                    <Skeleton className="h-4 w-20 mr-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-5 w-full mb-1" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-8 w-16 ml-4 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!newsArticles || newsArticles.length === 0) {
      return (
        <div className="col-span-full text-center py-10">
          <p className="text-neutral-600">No news articles available at the moment.</p>
        </div>
      );
    }

    return (
      <div className="col-span-full divide-y divide-neutral-200">
        {filteredArticles?.map(article => (
          <div key={article.id} className="flex items-start py-4 hover:bg-neutral-50 transition-colors cursor-pointer">
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
                <span className="px-2 py-1 rounded-full bg-primary-50 text-primary-600 text-xs flex items-center">
                  {CATEGORIES.find(cat => cat.id === article.category.toLowerCase())?.icon || '📰'} 
                  <span className="ml-1">{article.category}</span>
                </span>
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
    );
  };

  const handleToggleCategoryFilter = () => {
    setShowCategoryFilter(!showCategoryFilter);
  };

  const handleCategorySelect = (categoryId: string) => {
    setFilter(categoryId);
    setShowCategoryFilter(false);
  };
  
  const headerActions = (
    <>
      <Button 
        variant={showCategoryFilter ? "default" : "outline"} 
        size="sm" 
        className={showCategoryFilter ? "text-white" : "text-neutral-700"}
        onClick={handleToggleCategoryFilter}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
        Filter
      </Button>
      <Button variant="outline" size="sm" className="text-primary-700" onClick={handleOpenSearchPanel}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
        Smart Search
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
          
          {/* Category Filters */}
          {showCategoryFilter && (
            <div className="mt-4 mb-6">
              <Card className="p-4 bg-white border border-neutral-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium text-neutral-600">Filter by Category</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCategoryFilter(false)}
                    className="text-neutral-500 h-7 w-7 p-0 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {CATEGORIES.map(category => (
                    <Badge
                      key={category.id}
                      variant={filter === category.id ? "default" : "outline"}
                      className={`py-3 px-4 flex items-center gap-2 text-sm font-normal justify-start cursor-pointer ${
                        filter === category.id 
                          ? "bg-primary-600 hover:bg-primary-700 text-white" 
                          : "hover:bg-neutral-100"
                      }`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <span className="text-lg">{category.icon}</span>
                      {category.label}
                    </Badge>
                  ))}
                </div>
                {filter !== "all" && (
                  <div className="mt-3 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-neutral-600"
                      onClick={() => setFilter("all")}
                    >
                      Clear Filter
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          )}
          
          {/* Smart Search Results */}
          {showSearchResults && (
            <div className="mt-6 mb-6">
              <Card className="p-6 bg-primary-50 border border-primary-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge className="bg-primary-100 text-primary-700 border-none mb-2">Smart Analysis</Badge>
                    <h3 className="text-lg font-semibold text-neutral-800">Insights Summary</h3>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleCloseSearchResults} className="text-neutral-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </Button>
                </div>
                
                <div className="mb-4">
                  <Badge variant="outline" className="bg-white text-primary-700 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    Search: {currentSearch}
                  </Badge>
                  
                  <div className="bg-white rounded-lg p-4 border border-primary-200 text-neutral-700 whitespace-pre-line">
                    {`Based on the latest insurance news, here are the key insights related to your search:
                    
1. The insurance market is seeing significant developments in key areas related to your search.
    
2. Recent regulatory changes are affecting how insurers approach risk assessment and policy pricing, particularly in relation to your query.
    
3. There are new opportunities emerging for brokers who stay informed about these developments.
    
I've identified the most relevant articles in the list below. You can read them in full by clicking on them.`}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export as PDF
                  </Button>
                  <Button size="sm" variant="outline" className="bg-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    Email to Team
                  </Button>
                  <Button size="sm" className="ml-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                    Copy to Clipboard
                  </Button>
                </div>
              </Card>
            </div>
          )}
          
          <div className="bg-white overflow-hidden rounded-lg border border-neutral-200">
            {renderNewsItems()}
          </div>
          
          {newsArticles && newsArticles.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" className="border-primary-300 text-primary-600 hover:bg-primary-50">
                Load more news
              </Button>
            </div>
          )}
          
          {/* Smart Search Panel */}
          {isSearchPanelOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
              <Card className="w-full max-w-3xl p-6 bg-white rounded-xl shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-neutral-800">Smart News Search</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseSearchPanel}
                    className="rounded-full h-8 w-8 p-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <span className="sr-only">Close</span>
                  </Button>
                </div>

                <div className="relative mb-6">
                  <Input
                    type="text"
                    placeholder="Enter your search or select a suggestion below"
                    className="pr-12 py-6 text-base"
                    value={currentSearch}
                    onChange={(e) => setCurrentSearch(e.target.value)}
                  />
                  <Button
                    className="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() => {
                      if (currentSearch.trim()) {
                        handleSearch(currentSearch);
                        handleCloseSearchPanel();
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    Search
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-neutral-500">Suggested Searches</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      {
                        id: "regulations",
                        label: "New EU Regulations",
                        prompt: "Summarize the latest EU insurance regulations",
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m16 6 4 14" />
                            <path d="M12 6v14" />
                            <path d="M8 8v12" />
                            <path d="M4 4v16" />
                          </svg>
                        ),
                      },
                      {
                        id: "climate",
                        label: "Climate Risk",
                        prompt: "Highlight news about climate risk in insurance",
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                          </svg>
                        ),
                      },
                      {
                        id: "cyber",
                        label: "Cyber Insurance",
                        prompt: "Extract insights about cyber insurance trends",
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.29 7 12 12 20.71 7" />
                            <line x1="12" y1="22" x2="12" y2="12" />
                          </svg>
                        ),
                      },
                      {
                        id: "competitors",
                        label: "Competitor Moves",
                        prompt: "Analyze recent moves by major insurance companies",
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                          </svg>
                        ),
                      },
                      {
                        id: "ai",
                        label: "AI & Automation",
                        prompt: "Find news about AI applications in insurance",
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 3H5a2 2 0 0 0-2 2v4" />
                            <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
                            <path d="M15 3h4a2 2 0 0 1 2 2v4" />
                            <path d="M15 21h4a2 2 0 0 0 2-2v-4" />
                            <path d="M12 8v8" />
                            <path d="M8 12h8" />
                          </svg>
                        ),
                      },
                      {
                        id: "custom",
                        label: "Custom Search",
                        prompt: "",
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                        ),
                      },
                    ].map((prompt) => (
                      <Badge
                        key={prompt.id}
                        variant="outline"
                        className="py-3 px-4 flex items-center gap-2 text-base font-normal justify-start cursor-pointer hover:bg-neutral-100"
                        onClick={() => {
                          setCurrentSearch(prompt.prompt);
                          if (prompt.prompt) {
                            handleSearch(prompt.prompt);
                            handleCloseSearchPanel();
                          }
                        }}
                      >
                        {prompt.icon}
                        {prompt.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <Button variant="outline" onClick={handleCloseSearchPanel}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={() => {
                      if (currentSearch.trim()) {
                        handleSearch(currentSearch);
                        handleCloseSearchPanel();
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                    Generate Smart Insights
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}