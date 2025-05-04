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
        <div className="h-40 bg-primary-100 flex items-center justify-center overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="News feed visual" 
            className="object-cover h-full w-full" 
          />
        </div>
        <CardContent className="p-5">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-xl">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-center text-neutral-800 mb-2">Latest Insurance News in Belgium</h3>
          <p className="text-neutral-600 text-sm text-center">Stay updated with the latest insurance industry news, policies and trends</p>
        </CardContent>
      </div>
      
      <div 
        className="navigation-tile" 
        onClick={() => setLocation("/compare")}
      >
        <div className="h-40 bg-primary-100 flex items-center justify-center overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Document comparison visual" 
            className="object-cover h-full w-full" 
          />
        </div>
        <CardContent className="p-5">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-xl">
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21h-7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l5 5v11a2 2 0 0 1-2 2Z" />
              <path d="M10 12h4" />
              <path d="M10 16h4" />
              <path d="M10 8h1" />
              <path d="M3 7v12a2 2 0 0 0 2 2h2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-center text-neutral-800 mb-2">Compare Files & Create Email</h3>
          <p className="text-neutral-600 text-sm text-center">Analyze policy documents and generate professional communications</p>
        </CardContent>
      </div>
      
      <div 
        className="navigation-tile" 
        onClick={() => setLocation("/predict")}
      >
        <div className="h-40 bg-primary-100 flex items-center justify-center overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Analytics dashboard visual" 
            className="object-cover h-full w-full" 
          />
        </div>
        <CardContent className="p-5">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-xl">
              <path d="M21 6H3" />
              <path d="M10 12H3" />
              <path d="M10 18H3" />
              <path d="m16 9-3 2.5L16 14" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-center text-neutral-800 mb-2">Predict Cross & Upsell Opportunities</h3>
          <p className="text-neutral-600 text-sm text-center">Use AI to identify potential upsell and cross-sell opportunities</p>
        </CardContent>
      </div>
    </div>
  );
}
