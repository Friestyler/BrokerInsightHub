import { BellIcon, HelpCircleIcon } from "lucide-react";
import qollabiLogo from "@/assets/qollabi_logo.png";

export default function Navbar() {
  return (
    <nav className="bg-primary-500 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              {/* Logo */}
              <img 
                src={qollabiLogo} 
                alt="Qollabi Logo" 
                className="w-10 h-10 object-contain"
              />
              <span className="ml-2 text-xl font-semibold text-white">Qollabi</span>
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-2 rounded-full text-primary-200 hover:text-white hover:bg-primary-600 focus:outline-none transition-colors">
              <HelpCircleIcon className="h-5 w-5" />
            </button>
            <button className="ml-3 p-2 rounded-full text-primary-200 hover:text-white hover:bg-primary-600 focus:outline-none transition-colors">
              <BellIcon className="h-5 w-5" />
            </button>
            <div className="ml-3 relative">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary-300 flex items-center justify-center">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-white"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <span className="ml-2 text-sm font-medium text-white">John Broker</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
