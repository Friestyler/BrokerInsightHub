import { useLocation, Link } from "wouter";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isActive = (path: string) => {
    return location === path || (path === "/" && ["/news", "/compare", "/predict"].includes(location));
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`${collapsed ? "w-16" : "w-16 md:w-64"} bg-white border-r border-neutral-200 flex flex-col py-4 transition-all duration-300 relative`}>
      <button 
        onClick={toggleCollapsed} 
        className="absolute -right-3 top-10 bg-white border border-neutral-200 rounded-full p-1 shadow-sm hidden md:flex items-center justify-center"
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
          className={`text-neutral-400 transform ${collapsed ? "" : "rotate-180"}`}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      {!collapsed && (
        <div className="px-4 mb-6 hidden md:block">
          <h3 className="text-xs uppercase text-neutral-500 font-medium">Main Navigation</h3>
        </div>
      )}
      <div className="flex flex-col space-y-1">
        <Link href="/">
          <a className={`flex items-center py-2 px-4 rounded-md mx-2 ${isActive("/") ? "bg-primary-100 text-primary-600" : "text-neutral-600 hover:bg-primary-100 hover:text-primary-600"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" />
              <path d="M19 17v4" />
              <path d="M3 5h4" />
              <path d="M17 19h4" />
            </svg>
            <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Broker Copilot</span>
          </a>
        </Link>
        <a href="#" className="flex items-center py-2 px-4 text-neutral-600 hover:bg-primary-100 hover:text-primary-600 rounded-md mx-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 19a6 6 0 0 0-12 0" />
            <circle cx="8" cy="9" r="4" />
            <path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8" />
          </svg>
          <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Partners</span>
        </a>
        <a href="#" className="flex items-center py-2 px-4 text-neutral-600 hover:bg-primary-100 hover:text-primary-600 rounded-md mx-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22 11 13 2 9 22 2z" />
          </svg>
          <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Smart Updates</span>
        </a>
        <a href="#" className="flex items-center py-2 px-4 text-neutral-600 hover:bg-primary-100 hover:text-primary-600 rounded-md mx-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Settings</span>
        </a>
      </div>
    </div>
  );
}
