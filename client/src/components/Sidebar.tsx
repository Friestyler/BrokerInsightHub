import { useLocation, Link } from "wouter";
import { useState, useEffect, useRef } from "react";
import EnvironmentSelector from "./EnvironmentSelector";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import qollabiLogo from "@assets/logo_qollabi_O_dark.png";

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed = false, setCollapsed }: SidebarProps) {
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const dataMenuRef = useRef<HTMLDivElement>(null);
  const { environment } = useEnvironment();
  
  // Auto-open the Lists menu when on a Lists page
  useEffect(() => {
    if (location.startsWith('/lists')) {
      setDataMenuOpen(true);
    }
  }, [location]);

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
      if (window.innerWidth < 768 && typeof setCollapsed === 'function') {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setCollapsed]);

  const toggleCollapsed = () => {
    if (typeof setCollapsed === 'function') {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div className={`${collapsed ? "w-16" : "w-16 md:w-64"} bg-gray-50 flex flex-col h-full overflow-hidden transition-all duration-300 relative`}>
      
      {/* Logo at the top left */}
      <div className="pt-4 px-4 pb-1 flex justify-center md:justify-start flex-shrink-0">
        <div className={`${collapsed ? "w-10 h-10" : "w-12 h-12"} flex items-center justify-center`}>
          <img 
            src={qollabiLogo} 
            alt="Qollabi Logo" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
      
      {/* Environment Selector - moved down */}
      <div className="py-3 px-3 mt-1 mb-1 flex-shrink-0">
        <EnvironmentSelector collapsed={collapsed} />
      </div>
      
      {/* Navigation Links - closer to environment selector */}
      <div className="flex flex-col flex-shrink-0 overflow-y-auto">
        <Link 
          href="/"
          className={`flex items-center py-2.5 px-4 rounded-md ${isActive("/") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
          </svg>
          <span className={`ml-3 text-sm ${collapsed ? "hidden" : "hidden md:inline-block"}`}>
            {environment.id === 'myqollabi' ? 'Broker Copilot' : 'Partner Copilot'}
          </span>
        </Link>
        <div ref={dataMenuRef} className="relative">
          <a 
            href="#" 
            className={`flex items-center py-2.5 px-4 rounded-md ${dataMenuOpen ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
            onClick={(e) => {
              e.preventDefault();
              setDataMenuOpen(!dataMenuOpen);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
            </svg>
            <span className={`ml-3 text-sm ${collapsed ? "hidden" : "hidden md:inline-block"}`}>
              {environment.id === 'myqollabi' ? 'Collaborate' : 'Collaborate'}
            </span>
            {!collapsed && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
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
          
          {/* Always show a tiny indicator on the sidebar if a list section is active */}
          {collapsed && !dataMenuOpen && location.startsWith('/lists') && (
            <div className="absolute top-[93px] right-0 w-1 h-7 bg-indigo-500 rounded-l-md"></div>
          )}
          
          {/* Dropdown menu - always visible even when collapsed */}
          {dataMenuOpen && (
            <div className={`${collapsed ? "absolute left-16 top-0 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50 w-48" : "mt-0.5"}`}>
              <Link 
                href="/lists/partners" 
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} ${location.startsWith("/lists/partners") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Partners
              </Link>
              <Link 
                href="/lists/customers" 
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} ${location.startsWith("/lists/customers") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Customers
              </Link>
              <Link 
                href="/lists/opportunities" 
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} ${location.startsWith("/lists/opportunities") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                Opportunities
              </Link>
              <Link 
                href="/lists/projects" 
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} ${location.startsWith("/lists/projects") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                Projects
              </Link>
              <Link 
                href="/lists/contacts" 
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} ${location.startsWith("/lists/contacts") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Contacts
              </Link>
            </div>
          )}
        </div>
        {/* Show Campaigns link for all environments - active for non-ACME, disabled for ACME */}
        {environment.id === 'acme' ? (
          <div className="flex items-center py-2.5 px-4 rounded-md text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9 22 2z" />
            </svg>
            <span className={`ml-3 text-sm ${collapsed ? "hidden" : "hidden md:inline-block"}`}>
              Campaigns
              <span className="ml-2 text-xs font-normal bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">Soon</span>
            </span>
          </div>
        ) : (
          <Link href="/campaigns" className={`flex items-center py-2.5 px-4 rounded-md ${location === "/campaigns" ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9 22 2z" />
            </svg>
            <span className={`ml-3 text-sm ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Campaigns</span>
          </Link>
        )}
        <a href="#" className={`flex items-center py-2.5 px-4 rounded-md text-gray-700 hover:bg-indigo-50 hover:text-indigo-600`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
          <span className={`ml-3 text-sm ${collapsed ? "hidden" : "hidden md:inline-block"}`}>More</span>
        </a>
      </div>
      <div className="mt-auto mb-4 flex-shrink-0">
        <a href="#" className={`flex items-center py-2.5 px-4 rounded-md text-gray-700 hover:bg-indigo-50 hover:text-indigo-600`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className={`ml-3 text-sm ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Settings</span>
        </a>
      </div>
    </div>
  );
}
