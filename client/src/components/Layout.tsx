import { ReactNode, useEffect, useState, memo, useMemo, useCallback } from "react";
import Sidebar from "./Sidebar";
import Breadcrumbs from "./Breadcrumbs";
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useLocation } from "wouter";
import { Menu } from "lucide-react";
import PartnerCopilotSlider from "./PartnerCopilotSlider";
import userAvatar from "@/assets/user-avatar.png";

interface LayoutProps {
  children: ReactNode;
}

function LayoutComponent({ children }: LayoutProps) {
  const { environment } = useEnvironment();
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Memoize environment-dependent values
  const environmentId = useMemo(() => environment.id, [environment.id]);
  
  // Memoize page title calculation to prevent unnecessary re-renders
  const currentPageTitle = useMemo(() => {
    if (location === "/") {
      return environmentId === 'myqollabi' ? 'Broker Copilot' : 'Partner Copilot';
    } else if (location === "/opportunities") {
      return "Opportunities";
    } else if (location === "/partners") {
      return "Partners";
    } else if (location === "/projects") {
      return "Projects";
    } else if (location === "/customers") {
      return "Customers";
    } else if (location === "/campaigns") {
      return "Campaigns";
    } else {
      return environmentId === 'myqollabi' ? 'Broker Copilot' : 'Partner Copilot';
    }
  }, [location, environmentId]);
  
  // Memoize callback to prevent sidebar re-renders
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);
  
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Sidebar first in the layout - fixed, not scrollable */}
      <div className="h-screen flex-shrink-0">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>
      {/* Main content column with top bar */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Top bar - fixed, not scrollable */}
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

            <Breadcrumbs />
          </div>
          
          <div className="flex items-center space-x-3">
            <PartnerCopilotSlider variant="ghost" />
            <button className="text-neutral-600 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all">
                <img 
                  src={userAvatar} 
                  alt="User Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area - scrollable */}
        <div className="flex-1 overflow-y-auto text-[#282A3F]">
          {children}
        </div>
      </div>
    </div>
  );
}

// Memoize the Layout to prevent unnecessary re-renders during navigation
const Layout = memo(LayoutComponent);
export default Layout;
