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
    <div className={`${collapsed ? "w-16" : "w-16 md:w-56"} bg-white border-r border-neutral-200 flex flex-col py-0 transition-all duration-300 relative h-full`}>
      {/* Logo placeholder - shown only on expanded view */}
      {!collapsed && (
        <div className="h-14 flex items-center px-4 border-b border-neutral-200 mb-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#5567E5" />
            <path d="M12 22C14.7614 22 17 19.7614 17 17C17 14.2386 14.7614 12 12 12C9.23858 12 7 14.2386 7 17C7 19.7614 9.23858 22 12 22Z" fill="#5567E5" />
          </svg>
        </div>
      )}
      
      <div className="flex flex-col space-y-1 pt-2">
        {/* Partner copilot */}
        <Link 
          href="/"
          className={`flex items-center h-8 px-4 mx-2 text-sm font-medium ${isActive("/") ? "text-[#5567E5]" : "text-neutral-600 hover:text-[#5567E5]"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.04 22c1.65 0 3-1.35 3-3v-2c0-2.87-2.2-5.22-5-5.47"></path>
            <circle cx="12" cy="5" r="3"></circle>
            <path d="M15 12a4 4 0 0 0-4 4v4h8.5c1.94 0 3.5-1.56 3.5-3.5S20.44 13 18.5 13c-.75 0-1.46.24-2.03.67"></path>
            <path d="M4 22c-1.65 0-3-1.35-3-3v-2c0-2.87 2.2-5.22 5-5.47"></path>
            <path d="M9 12a4 4 0 0 1 4 4v4H4.5c-1.94 0-3.5-1.56-3.5-3.5S2.56 13 4.5 13c.75 0 1.46.24 2.03.67"></path>
          </svg>
          <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Partner copilot</span>
        </Link>
        
        {/* Data section */}
        <div className="px-4 py-2">
          <p className={`text-xs font-medium text-neutral-400 uppercase ${collapsed ? "hidden" : "hidden md:block"}`}>Data</p>
        </div>
        
        {/* Data */}
        <div ref={dataMenuRef} className="relative">
          <Link 
            href="/clients"
            className={`flex items-center h-8 px-4 mx-2 text-sm font-medium ${location === "/clients" ? "text-[#5567E5]" : "text-neutral-600 hover:text-[#5567E5]"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2"></rect>
              <line x1="2" x2="22" y1="10" y2="10"></line>
            </svg>
            <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Opportunities</span>
          </Link>
        </div>
        
        {/* Partners */}
        <Link 
          href="/partners" 
          className={`flex items-center h-8 px-4 mx-2 text-sm font-medium ${location === "/partners" ? "text-[#5567E5]" : "text-neutral-600 hover:text-[#5567E5]"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Partners</span>
        </Link>
        
        {/* Projects */}
        <Link 
          href="/projects" 
          className={`flex items-center h-8 px-4 mx-2 text-sm font-medium ${location === "/projects" ? "text-[#5567E5]" : "text-neutral-600 hover:text-[#5567E5]"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path>
            <path d="M3 7.6v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8"></path>
            <path d="M15 2v5h5"></path>
          </svg>
          <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Projects</span>
        </Link>
        
        {/* Customers */}
        <Link 
          href="/customers" 
          className={`flex items-center h-8 px-4 mx-2 text-sm font-medium ${location === "/customers" ? "text-[#5567E5]" : "text-neutral-600 hover:text-[#5567E5]"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Customers</span>
        </Link>
        
        {/* Updates section */}
        <div className="px-4 py-2 mt-2">
          <p className={`text-xs font-medium text-neutral-400 uppercase ${collapsed ? "hidden" : "hidden md:block"}`}>Updates</p>
        </div>
        
        {/* Smart updates */}
        <Link 
          href="/campaigns" 
          className={`flex items-center h-8 px-4 mx-2 text-sm font-medium ${location === "/campaigns" ? "text-[#5567E5]" : "text-neutral-600 hover:text-[#5567E5]"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 3 3 9-3 9 19-9-19-9Z" />
            <path d="M13 13h8" />
          </svg>
          <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Smart updates</span>
        </Link>
        
        {/* More button */}
        <div className="mt-auto pt-4">
          <Link 
            href="/more"
            className={`flex items-center h-8 px-4 mx-2 text-sm font-medium ${location === "/more" ? "text-[#5567E5]" : "text-neutral-600 hover:text-[#5567E5]"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
            <span className={`ml-2 ${collapsed ? "hidden" : "hidden md:inline-block"}`}>More</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
