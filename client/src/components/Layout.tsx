import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { useLocation } from "wouter";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { environment } = useEnvironment();
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPageTitle, setCurrentPageTitle] = useState("");
  
  // Calculate the current page title based on the location
  useEffect(() => {
    if (location === "/") {
      setCurrentPageTitle(environment.id === 'myqollabi' ? 'Broker Copilot' : 'Partner Copilot');
    } else if (location === "/opportunities") {
      setCurrentPageTitle("Opportunities");
    } else if (location === "/partners") {
      setCurrentPageTitle("Partners");
    } else if (location === "/projects") {
      setCurrentPageTitle("Projects");
    } else if (location === "/customers") {
      setCurrentPageTitle("Customers");
    } else if (location === "/campaigns") {
      setCurrentPageTitle("Campaigns");
    } else {
      setCurrentPageTitle(environment.id === 'myqollabi' ? 'Broker Copilot' : 'Partner Copilot');
    }
  }, [location, environment]);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Sidebar first in the layout */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      
      {/* Main content column with top bar */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top bar */}
        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4">
          <div className="flex items-center">
            <button 
              className="mr-3 text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={toggleSidebar}
            >
              <Menu size={18} />
            </button>
            <div className="text-gray-700 font-medium flex items-center">
              <div className="flex items-center">
                {location !== "/" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  </svg>
                )}
                {currentPageTitle}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm"
              className="rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
              {environment.id === 'myqollabi' ? 'Ask broker copilot' : 'Ask partner copilot'}
            </Button>
            <button className="text-neutral-600 hover:text-neutral-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium text-sm">
                JS
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
