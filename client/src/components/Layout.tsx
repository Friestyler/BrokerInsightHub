import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import qollabiLogo from "@assets/qollabi-logo.png";
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/contexts/EnvironmentContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { environment } = useEnvironment();
  
  return (
    <div className="min-h-screen flex">
      {/* Sidebar first in the layout */}
      <Sidebar />
      
      {/* Main content column */}
      <div className="flex-1 flex flex-col">
        {/* Top navigation bar */}
        <nav className="bg-white px-4 h-14 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={qollabiLogo} alt="Logo" className="h-8 w-8" />
            </div>
            {/* Removed page title */}
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
        </nav>

        {/* Main content area */}
        <div className="flex-1 overflow-auto bg-white">
          {children}
        </div>
      </div>
    </div>
  );
}
