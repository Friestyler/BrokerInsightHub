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
  const [templatesMenuOpen, setTemplatesMenuOpen] = useState(false);
  const [smartUpdatesMenuOpen, setSmartUpdatesMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const dataMenuRef = useRef<HTMLDivElement>(null);
  const { environment } = useEnvironment();
  
  // Auto-open the appropriate menu when on relevant pages
  useEffect(() => {
    if (location.startsWith('/partners') || location.startsWith('/customers') || location.startsWith('/opportunities') || location.startsWith('/vendors') || location.startsWith('/products') || location.startsWith('/projects') || location.startsWith('/contacts')) {
      setDataMenuOpen(true);
      setTemplatesMenuOpen(false);
      setSmartUpdatesMenuOpen(false);
      setSettingsMenuOpen(false);
    } else if (location.startsWith('/templates')) {
      setTemplatesMenuOpen(true);
      setDataMenuOpen(false);
      setSmartUpdatesMenuOpen(false);
      setSettingsMenuOpen(false);
    } else if (location.startsWith('/smart-updates')) {
      setSmartUpdatesMenuOpen(true);
      setDataMenuOpen(false);
      setTemplatesMenuOpen(false);
      setSettingsMenuOpen(false);
    } else if (location.startsWith('/settings')) {
      setSettingsMenuOpen(true);
      setDataMenuOpen(false);
      setTemplatesMenuOpen(false);
      setSmartUpdatesMenuOpen(false);
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

  const navigateTo = (path: string) => {
    window.location.href = path;
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
            {environment.id === 'myqollabi' ? 'Partner Pilot' : 'Partner Pilot'}
          </span>
        </Link>
        <div ref={dataMenuRef} className="relative">
          <button 
            className={`flex items-center py-2.5 px-4 rounded-md w-full text-left ${dataMenuOpen ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
            onClick={() => setDataMenuOpen(!dataMenuOpen)}
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
          </button>
          
          {/* Always show a tiny indicator on the sidebar if a list section is active */}
          {collapsed && !dataMenuOpen && (location.startsWith('/partners') || location.startsWith('/customers') || location.startsWith('/opportunities') || location.startsWith('/vendors') || location.startsWith('/products') || location.startsWith('/projects') || location.startsWith('/contacts')) && (
            <div className="absolute top-[93px] right-0 w-1 h-7 bg-indigo-500 rounded-l-md"></div>
          )}
          
          {/* Dropdown menu - always visible even when collapsed */}
          {dataMenuOpen && (
            <div className={`${collapsed ? "absolute left-16 top-0 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50 w-48" : "mt-0.5"}`}>
              <button
                onClick={() => navigateTo('/partners')}
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/partners") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Partners
              </button>
              <button
                onClick={() => navigateTo('/customers')}
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/customers") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Customers
              </button>
              <button
                onClick={() => navigateTo('/opportunities')}
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/opportunities") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                Opportunities
              </button>
              {/* Hidden for now - will be used later
              <button
                onClick={() => navigateTo('/opportunities')}
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/opportunities") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                Opportunities
              </button>
              */}
              <button
                onClick={() => navigateTo('/projects')}
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/projects") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                Projects
              </button>
              <button
                onClick={() => navigateTo('/contacts')}
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/contacts") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Contacts
              </button>
              <button
                onClick={() => navigateTo('/vendors')}
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/vendors") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"></path>
                  <path d="m7 16.5-4.74-2.85"></path>
                  <path d="m7 16.5 5-3"></path>
                  <path d="M7 16.5v5.17"></path>
                  <path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"></path>
                  <path d="m17 16.5-5-3"></path>
                  <path d="m17 16.5 4.74-2.85"></path>
                  <path d="M17 16.5v5.17"></path>
                  <path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"></path>
                  <path d="M12 8 7.26 5.15"></path>
                  <path d="m12 8 4.74-2.85"></path>
                  <path d="M12 13.5V8"></path>
                </svg>
                Vendors
              </button>
              <button
                onClick={() => navigateTo('/products')}
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/products") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 7v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <path d="m14 9 7-7"></path>
                  <path d="M9 14h.01"></path>
                  <path d="M9 3 7 5 9 7 7 9"></path>
                  <path d="M14 3h.01"></path>
                  <path d="M19 3h.01"></path>
                </svg>
                Products
              </button>
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
          <button 
            onClick={() => navigateTo('/campaigns')}
            className={`flex items-center py-2.5 px-4 rounded-md w-full text-left ${location === "/campaigns" ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9 22 2z" />
            </svg>
            <span className={`ml-3 text-sm ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Campaigns</span>
          </button>
        )}
        <div className="relative">
          <button 
            className={`flex items-center py-2.5 px-4 rounded-md w-full text-left ${location.startsWith("/templates") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
            onClick={() => {
              // Toggle the templates submenu when templates is clicked
              const newValue = !templatesMenuOpen;
              setTemplatesMenuOpen(newValue);
              // Close the data menu when opening templates menu
              if (newValue) {
                setDataMenuOpen(false);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
            <span className={`ml-3 text-sm ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Templates</span>
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
                className={`ml-auto transition-transform ${templatesMenuOpen ? 'rotate-180' : ''} ${collapsed ? "hidden" : "hidden md:inline-block"}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </button>
          
          {/* Always show a tiny indicator on the sidebar if a templates section is active */}
          {collapsed && !templatesMenuOpen && location.startsWith('/templates') && (
            <div className="absolute top-[93px] right-0 w-1 h-7 bg-indigo-500 rounded-l-md"></div>
          )}
          
          {/* Templates submenu */}
          {templatesMenuOpen && (
            <div className={`${collapsed ? "absolute left-16 top-0 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50 w-48" : "mt-0.5"}`}>
              <button
                onClick={() => navigateTo('/templates/okr-metrics')}
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/templates/okr-metrics") || location.startsWith("/templates/groups") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  <path d="M12 8v4l3 3"></path>
                  <circle cx="12" cy="12" r="7"></circle>
                </svg>
                OKR Metrics
              </button>
            </div>
          )}
        </div>
        
        {/* Smart Updates Section */}
        <div className="relative">
          <button 
            className={`flex items-center py-2.5 px-4 rounded-md w-full text-left ${location.startsWith("/smart-updates") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
            onClick={() => {
              const newValue = !smartUpdatesMenuOpen;
              setSmartUpdatesMenuOpen(newValue);
              if (newValue) {
                setDataMenuOpen(false);
                setTemplatesMenuOpen(false);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1v6m0 0 4-4m-4 4L8 3"></path>
              <path d="M12 23v-6m0 0 4 4m-4-4-4 4"></path>
              <path d="M20 12h-2"></path>
              <path d="M6 12H4"></path>
              <path d="M17.657 6.343l-1.414 1.414"></path>
              <path d="M7.757 16.243l-1.414 1.414"></path>
              <path d="M17.657 17.657l-1.414-1.414"></path>
              <path d="M7.757 7.757l-1.414-1.414"></path>
            </svg>
            <span className={`ml-3 text-sm ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Smart Updates</span>
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
                className={`ml-auto transition-transform ${smartUpdatesMenuOpen ? 'rotate-180' : ''} ${collapsed ? "hidden" : "hidden md:inline-block"}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </button>
          
          {/* Smart Updates indicator when collapsed */}
          {collapsed && !smartUpdatesMenuOpen && location.startsWith('/smart-updates') && (
            <div className="absolute top-[93px] right-0 w-1 h-7 bg-indigo-500 rounded-l-md"></div>
          )}
          
          {/* Smart Updates submenu */}
          {smartUpdatesMenuOpen && (
            <div className={`${collapsed ? "absolute left-16 top-0 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50 w-48" : "mt-0.5"}`}>
              <button
                onClick={() => navigateTo('/smart-updates/notifications')}
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/smart-updates/notifications") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                </svg>
                Notifications
              </button>
              <button
                onClick={() => navigateTo('/smart-updates/automated')}
                className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/smart-updates/automated") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v6l3-3 3 3"></path>
                  <path d="M21 12h-6l3-3 3 3"></path>
                  <path d="M12 22v-6l3 3 3-3"></path>
                  <path d="M3 12h6l-3-3-3 3"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Smart Updates
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="mt-auto mb-4 flex-shrink-0 relative">
        <button 
          className={`flex items-center py-2.5 px-4 rounded-md w-full text-left ${settingsMenuOpen ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
          onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className={`ml-3 text-sm ${collapsed ? "hidden" : "hidden md:inline-block"}`}>Settings</span>
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
              className={`ml-auto transition-transform ${settingsMenuOpen ? 'rotate-180' : ''} ${collapsed ? "hidden" : "hidden md:inline-block"}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          )}
        </button>

        {/* Settings dropdown menu */}
        {settingsMenuOpen && (
          <div className={`${collapsed ? "absolute left-16 bottom-0 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50 w-48" : "mt-0.5"}`}>
            <button
              onClick={() => navigateTo('/settings/users')}
              className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/settings/users") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              User Management
            </button>
            <button
              onClick={() => navigateTo('/settings/developer')}
              className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/settings/developer") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              Developer Dashboard
            </button>
            <button
              onClick={() => navigateTo('/settings/database')}
              className={`flex py-2 text-sm ${collapsed ? "px-4" : "pl-12"} w-full text-left ${location.startsWith("/settings/database") ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M3 5v14a9 3 0 0 0 18 0V5"></path>
                <path d="M3 12a9 3 0 0 0 18 0"></path>
              </svg>
              Database Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}