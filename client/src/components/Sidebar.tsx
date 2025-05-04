import { useLocation, Link } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="w-16 md:w-64 bg-white border-r border-neutral-200 flex flex-col py-4">
      <div className="px-4 mb-6 hidden md:block">
        <h3 className="text-xs uppercase text-neutral-500 font-medium">Main Navigation</h3>
      </div>
      <div className="flex flex-col space-y-1">
        <Link href="/dashboard">
          <a className={`flex items-center py-2 px-4 rounded-md mx-2 ${isActive("/dashboard") ? "bg-primary-100 text-primary-600" : "text-neutral-600 hover:bg-primary-100 hover:text-primary-600"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="ml-2 hidden md:inline-block">Dashboard</span>
          </a>
        </Link>
        <Link href="/">
          <a className={`flex items-center py-2 px-4 rounded-md mx-2 ${isActive("/") ? "bg-primary-100 text-primary-600" : "text-neutral-600 hover:bg-primary-100 hover:text-primary-600"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 12h-6.5a2.5 2.5 0 0 0 0 5H16" />
              <path d="M14 7H7.5a2.5 2.5 0 0 0 0 5H14" />
            </svg>
            <span className="ml-2 hidden md:inline-block">Broker AI Tools</span>
          </a>
        </Link>
        <a href="#" className="flex items-center py-2 px-4 text-neutral-600 hover:bg-primary-100 hover:text-primary-600 rounded-md mx-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 19a6 6 0 0 0-12 0" />
            <circle cx="8" cy="9" r="4" />
            <path d="M22 19a6 6 0 0 0-6-6 4 4 0 1 0 0-8" />
          </svg>
          <span className="ml-2 hidden md:inline-block">Partners</span>
        </a>
        <a href="#" className="flex items-center py-2 px-4 text-neutral-600 hover:bg-primary-100 hover:text-primary-600 rounded-md mx-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          <span className="ml-2 hidden md:inline-block">Reports</span>
        </a>
        <a href="#" className="flex items-center py-2 px-4 text-neutral-600 hover:bg-primary-100 hover:text-primary-600 rounded-md mx-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span className="ml-2 hidden md:inline-block">Settings</span>
        </a>
      </div>
    </div>
  );
}
