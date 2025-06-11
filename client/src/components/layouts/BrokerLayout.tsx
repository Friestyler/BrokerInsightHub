import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu } from 'lucide-react';
import qollabiLogo from "@assets/logo_qollabi_O_dark.png";

// Shared Broker Layout Component
export function BrokerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [dataMenuOpen, setDataMenuOpen] = useState(true);
  const [location] = useLocation();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const isPartnersPage = location === '/broker-view/partners';
  const isOpportunitiesPage = location.startsWith('/broker-view/list/');

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar - using same structure as main sidebar */}
      <div className={`${sidebarCollapsed ? "w-16" : "w-16 md:w-64"} environment-selector-bg flex flex-col h-full overflow-hidden transition-all duration-300 relative`}>
        
        {/* Qollabi Logo */}
        <div className="pt-4 px-4 pb-1 flex justify-center md:justify-start flex-shrink-0">
          <div className={`${sidebarCollapsed ? "w-10 h-10" : "w-12 h-12"} flex items-center justify-center`}>
            <img 
              src={qollabiLogo} 
              alt="Qollabi Logo" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="flex flex-col flex-shrink-0 overflow-y-auto px-2 pt-4">
          {/* Broker Copilot - disabled */}
          <div className="nav-container nav-item-inactive cursor-not-allowed">
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
              className={`nav-container ${dataMenuOpen ? "nav-item-active" : "nav-item-inactive"}`}
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
                  <div className={`submenu-nav-container ${isPartnersPage ? "nav-item-active" : "nav-item-inactive"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Partners
                  </div>
                </Link>
                <Link href="/broker-view/list/2">
                  <div className={`submenu-nav-container ${isOpportunitiesPage ? "nav-item-active" : "nav-item-inactive"}`}>
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
          <div className="nav-container nav-item-inactive cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9 22 2z" />
            </svg>
            <span className={`ml-3 text-sm ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}>Campaigns</span>
          </div>
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
              <Menu size={18} />
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