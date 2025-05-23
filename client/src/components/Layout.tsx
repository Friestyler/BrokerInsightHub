import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Breadcrumbs from "./Breadcrumbs";
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
              <Menu size={18} />
            </button>
            
            <div className="ml-4">
              <Breadcrumbs />
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
            <button className="text-neutral-600 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium text-sm cursor-pointer hover:bg-indigo-600">

                FP

              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area - scrollable */}
        <div className={`flex-1 overflow-y-auto ${sidebarCollapsed ? 'pl-8' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
