import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import qollabiLogo from "@assets/qollabi-logo.png";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Top navigation bar */}
      <nav className="bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 flex items-center justify-center">
            <img src={qollabiLogo} alt="Qollabi Logo" className="h-7 w-7" />
          </div>
          <span className="ml-3 text-lg font-semibold text-neutral-800">Qollabi</span>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-neutral-500 hover:text-neutral-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
          <button className="text-neutral-500 hover:text-neutral-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-medium">
              JS
            </div>
            <span className="text-sm text-neutral-700 hidden md:inline-block">John Smith</span>
          </div>
        </div>
      </nav>

      {/* Main content area */}
      <div className="flex flex-1 h-[calc(100vh-56px)]">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
