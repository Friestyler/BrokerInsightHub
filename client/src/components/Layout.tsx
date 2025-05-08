import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import qollabiLogo from "@assets/Copy of logo_qollabi_O_dark.png";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [selectedOrg, setSelectedOrg] = useState("My Qollabi");
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
      <nav className="bg-white border-b border-neutral-200 h-16 flex items-center justify-between">
        {/* Company selector */}
        <div className="border-r border-neutral-200 h-full flex items-center px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 font-medium text-sm">
                <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://placehold.co/100x100?text=A" 
                    alt="Acme Corp" 
                    className="h-6 w-6 object-cover"
                  />
                </div>
                {selectedOrg}
                <ChevronDown className="h-4 w-4 text-neutral-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedOrg("My Qollabi")}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center overflow-hidden">
                    <img src={qollabiLogo} alt="Qollabi Logo" className="h-4 w-4" />
                  </div>
                  <span>My Qollabi</span>
                  {selectedOrg === "My Qollabi" && <Check className="ml-auto h-4 w-4" />}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedOrg("Acme Corp")}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-neutral-200 flex items-center justify-center">
                    A
                  </div>
                  <span>Acme Corp</span>
                  {selectedOrg === "Acme Corp" && <Check className="ml-auto h-4 w-4" />}
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Opportunities page title - only for this demo */}
        <div className="flex-1 flex justify-start px-4">
          <h1 className="text-lg font-semibold">Opportunities</h1>
        </div>

        <div className="flex items-center space-x-3 px-4">
          {/* Ask partner copilot button */}
          <Button variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 hover:text-purple-700 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            Ask partner copilot
          </Button>
          
          {/* Notification bell */}
          <button className="text-neutral-500 hover:text-neutral-700 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
          
          {/* User avatar */}
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
            JS
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <div className="flex flex-1 h-[calc(100vh-64px)]">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
