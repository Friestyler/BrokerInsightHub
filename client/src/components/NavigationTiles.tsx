import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

export default function NavigationTiles() {
  const [, setLocation] = useLocation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      <div 
        className="navigation-tile" 
        onClick={() => setLocation("/news")}
      >
        <div className="h-40 bg-primary-100 flex items-center justify-center">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary-200 text-primary-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold text-center text-neutral-800 mb-2">Latest Insurance News in Belgium</h3>
          <p className="text-neutral-600 text-sm text-center">Stay updated with the latest insurance industry news, policies and trends</p>
        </CardContent>
      </div>
      
      <div 
        className="navigation-tile" 
        onClick={() => setLocation("/compare")}
      >
        <div className="h-40 bg-primary-100 flex items-center justify-center">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary-200 text-primary-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21h-7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l5 5v11a2 2 0 0 1-2 2Z" />
              <path d="M10 12h4" />
              <path d="M10 16h4" />
              <path d="M10 8h1" />
              <path d="M3 7v12a2 2 0 0 0 2 2h2" />
            </svg>
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold text-center text-neutral-800 mb-2">Compare Files & Create Email</h3>
          <p className="text-neutral-600 text-sm text-center">Analyze policy documents and generate professional communications</p>
        </CardContent>
      </div>
      
      <div 
        className="navigation-tile" 
        onClick={() => setLocation("/predict")}
      >
        <div className="h-40 bg-primary-100 flex items-center justify-center">
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-primary-200 text-primary-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
              <circle cx="9" cy="9" r="2" />
              <circle cx="19" cy="5" r="2" />
            </svg>
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="text-lg font-semibold text-center text-neutral-800 mb-2">Cross & Upsell Campaigns</h3>
          <p className="text-neutral-600 text-sm text-center">Use AI to identify potential upsell and cross-sell opportunities</p>
        </CardContent>
      </div>
    </div>
  );
}
