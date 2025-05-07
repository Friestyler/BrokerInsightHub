import { useLocation, Link } from "wouter";
import { useState, useEffect, useRef } from "react";

export default function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const dataMenuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => {
    return location === path || (path === "/" && ["/news", "/compare", "/predict"].includes(location));
  };
  
  // Close data menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dataMenuRef.current && !dataMenuRef.current.contains(event.target as Node)) {
        setDataMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      {/* Main Navigation heading section removed */}
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
        <div ref={dataMenuRef} className="relative">
          <a 
            href="#" 
            className="flex items-center py-2 px-4 text-neutral-600 hover:bg-primary-100 hover:text-primary-600 rounded-md mx-2"
            onClick={(e) => {
              e.preventDefault();
              setDataMenuOpen(!dataMenuOpen);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
            </svg>
            <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Data</span>
            {!collapsed && (
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
                className={`ml-auto transition-transform ${dataMenuOpen ? 'rotate-180' : ''} ${collapsed ? "hidden" : "hidden md:inline-block"}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </a>
          
          {/* Dropdown menu */}
          {dataMenuOpen && !collapsed && (
            <div className="absolute left-0 mt-1 w-full md:w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-neutral-200">
              <a href="#/clients" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Clients
                </div>
              </a>
              <a href="#/opportunities" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  Opportunities
                </div>
              </a>
              <a href="#/partners" className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-600">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 19a6 6 0 0 0-12 0" />
                    <circle cx="8" cy="9" r="4" />
                    <path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8" />
                  </svg>
                  Partners
                </div>
              </a>
            </div>
          )}
        </div>
        <a href="#" className="flex items-center py-2 px-4 text-neutral-600 hover:bg-primary-100 hover:text-primary-600 rounded-md mx-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22 11 13 2 9 22 2z" />
          </svg>
          <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Smart Updates</span>
        </a>
        <a href="#" className="flex items-center py-2 px-4 text-neutral-600 hover:bg-primary-100 hover:text-primary-600 rounded-md mx-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
          <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>More</span>
        </a>
      </div>
    </div>
  );
}
