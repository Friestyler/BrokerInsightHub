import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import qollabiLogo from "@assets/logo_qollabi_O_dark.png";
import nnLogo from "@assets/NN_Group_logo_1751474283145.jpeg";
import baloiseLogoPng from "@assets/Baloise_1750499789244.png";
import deGoudseLogo from "@assets/De_Goudse_logo_1749670246231.png";

// Shared Broker Layout Component
export function BrokerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [dataMenuOpen, setDataMenuOpen] = useState(true);
  const [location] = useLocation();
  const [currentEnvironment, setCurrentEnvironment] = useState('degoudse');

  // Direct environment detection from localStorage and window
  useEffect(() => {
    const detectEnvironment = () => {
      const envFromStorage = localStorage.getItem('selectedEnvironment');
      const envFromWindow = (window as any).selectedEnvironment;
      const currentEnv = envFromWindow || envFromStorage || 'degoudse';
      
      console.log('🚨 BROKER LAYOUT - Environment detection:', {
        envFromStorage,
        envFromWindow,
        currentEnv
      });
      
      setCurrentEnvironment(currentEnv);
    };

    // Initial detection
    detectEnvironment();

    // Listen for storage changes
    const handleStorageChange = () => {
      detectEnvironment();
    };

    // Listen for custom environment change events
    const handleEnvironmentChange = (event: any) => {
      console.log('🚨 BROKER LAYOUT - Environment change event:', event.detail);
      setCurrentEnvironment(event.detail.environmentId);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('environmentChanged', handleEnvironmentChange);

    // Poll for changes every 500ms as fallback
    const interval = setInterval(detectEnvironment, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('environmentChanged', handleEnvironmentChange);
      clearInterval(interval);
    };
  }, []);

  // Comprehensive logo mapping system for all environments - easily extensible
  const environmentLogos = {
    degoudse: deGoudseLogo,
    baloise: baloiseLogoPng,
    nn: nnLogo,
    qollabi: qollabiLogo,
    // Add new environments here as they're added
    // Example: newenv: newEnvLogo,
  };

  // Get the correct logo for broker view with fallback
  const getBrokerLogo = (envId: string) => {
    console.log('🚨 BROKER LAYOUT - Getting logo for environment:', envId);
    return environmentLogos[envId as keyof typeof environmentLogos] || deGoudseLogo;
  };

  const environmentLogo = getBrokerLogo(currentEnvironment);
  console.log('🚨 BROKER LAYOUT - Using logo:', environmentLogo);
  console.log('🚨 BROKER LAYOUT - Current environment:', currentEnvironment);

  // Get environment name for display
  const getEnvironmentName = (envId: string) => {
    switch (envId) {
      case 'degoudse':
        return 'De Goudse';
      case 'baloise':
        return 'Baloise';
      case 'nn':
        return 'Nationale Nederlanden';
      default:
        return 'De Goudse';
    }
  };

  const environmentName = getEnvironmentName(currentEnvironment);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const isPartnersPage = location === '/broker-view/partners';
  const isOpportunitiesPage = location.startsWith('/broker-view/list/');
  const isCollaborateActive = isPartnersPage || isOpportunitiesPage;

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar - using same structure as main sidebar */}
      <div className={`${sidebarCollapsed ? "w-16" : "w-16 md:w-64"} environment-selector-bg flex flex-col h-full overflow-hidden transition-all duration-300 relative`}>
        
        {/* Environment Logo */}
        <div className="pt-4 px-4 pb-1 flex justify-center md:justify-start flex-shrink-0">
          <div className={`${sidebarCollapsed ? "w-10 h-10" : "w-12 h-12"} flex items-center justify-center`}>
            <img 
              src={environmentLogo} 
              alt={`${environmentName} Logo`} 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-col flex-shrink-0 overflow-y-auto px-2 pt-4">
          {/* Broker Copilot - disabled */}
          <div className="nav-container nav-item-inactive cursor-not-allowed opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" />
              <path d="M19 17v4" />
              <path d="M3 5h4" />
              <path d="M17 19h4" />
            </svg>
            <span className={`ml-3 text-sm ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}>
              Broker Copilot
            </span>
          </div>

          {/* Collaborate section */}
          <div className="relative">
            <button 
              className={`nav-container ${(sidebarCollapsed && isCollaborateActive) || dataMenuOpen ? "nav-item-active" : "nav-item-inactive"}`}
              onClick={() => setDataMenuOpen(!dataMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
              </svg>
              <span className={`ml-3 text-sm ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}>
                Collaborate
              </span>
              {!sidebarCollapsed && (
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
                  className={`ml-auto transition-transform ${dataMenuOpen ? '' : 'rotate-90'} ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </button>
            
            {/* Dropdown menu */}
            {dataMenuOpen && (
              <div className={`${sidebarCollapsed ? "absolute left-16 top-0 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50 w-48" : "mt-0.5"}`}>
                <Link href="/broker-view/partners">
                  <div className={`${sidebarCollapsed ? "flex py-2 text-sm px-4 w-full text-left cursor-pointer" : "submenu-nav-container"} ${isPartnersPage ? "bg-indigo-50 nav-item-active" : "hover:bg-indigo-50 nav-item-inactive"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Partners
                  </div>
                </Link>
                <Link href="/broker-view/list/2">
                  <div className={`${sidebarCollapsed ? "flex py-2 text-sm px-4 w-full text-left cursor-pointer" : "submenu-nav-container"} ${isOpportunitiesPage ? "bg-indigo-50 nav-item-active" : "hover:bg-indigo-50 nav-item-inactive"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    Opportunities
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Campaigns */}
          <Link href="/broker-view/campaigns">
            <div className={`nav-container ${location === "/broker-view/campaigns" ? "nav-item-active" : "nav-item-inactive hover:bg-indigo-50"} cursor-pointer`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22 11 13 2 9 22 2z" />
              </svg>
              <span className={`ml-3 text-sm ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}>Campaigns</span>
            </div>
          </Link>
        </div>
      </div>
      
      {/* Main content column with top bar */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Top bar */}
        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              className="text-gray-600 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50 focus:outline-none"
              onClick={toggleSidebar}
            >
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1.5V12.5H14C14.25 12.5 14.5 12.2812 14.5 12V2C14.5 1.75 14.25 1.5 14 1.5H7ZM0 2C0 0.90625 0.875 0 2 0H14C15.0938 0 16 0.90625 16 2V12C16 13.125 15.0938 14 14 14H2C0.875 14 0 13.125 0 12V2ZM2 2.75C2 3.1875 2.3125 3.5 2.75 3.5H4.25C4.65625 3.5 5 3.1875 5 2.75C5 2.34375 4.65625 2 4.25 2H2.75C2.3125 2 2 2.34375 2 2.75ZM2.75 5C2.3125 5 2 5.34375 2 5.75C2 6.1875 2.3125 6.5 2.75 6.5H4.25C4.65625 6.5 5 6.1875 5 5.75C5 5.34375 4.65625 5 4.25 5H2.75ZM2 8.75C2 9.1875 2.3125 9.5 2.75 9.5H4.25C4.65625 9.5 5 9.1875 5 8.75C5 8.34375 4.65625 8 4.25 8H2.75C2.3125 8 2 8.34375 2 8.75Z" fill="currentColor"/>
              </svg>
            </button>
            <div className="text-sm text-gray-600">Broker View</div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* No avatar for anonymous partner view */}
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}