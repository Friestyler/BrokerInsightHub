import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import qollabiLogo from "@assets/qollabi-logo.png";
import { Button } from "@/components/ui/button";
import { useEnvironment } from "@/contexts/EnvironmentContext";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar first in the layout */}
      <Sidebar />
      
      {/* Main content column - removed top navigation bar */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
