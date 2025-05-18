import { Link, useLocation } from "wouter";
import { useMemo } from "react";

interface BreadcrumbItem {
  label: string;
  path: string;
  isCurrent: boolean;
}

export default function Breadcrumbs() {
  const [location] = useLocation();
  
  const breadcrumbs = useMemo(() => {
    if (location === '/') {
      return [];
    }

    const paths = location.split('/').filter(Boolean);
    let currentPath = '';
    const items: BreadcrumbItem[] = [];

    // Add Home breadcrumb if not on home page
    if (paths.length > 0) {
      items.push({
        label: 'Home',
        path: '/',
        isCurrent: false
      });
    }

    // Build the rest of the breadcrumb items
    paths.forEach((part, index) => {
      currentPath += `/${part}`;
      
      // Format the label from the path part
      let label = part.charAt(0).toUpperCase() + part.slice(1);
      
      // If it's a specific ID (like /partners/1), try to make it more readable
      if (!isNaN(Number(part)) && index > 0) {
        const entityType = paths[index - 1];
        label = `${entityType.slice(0, -1)} ${part}`;
      }
      
      items.push({
        label,
        path: currentPath,
        isCurrent: index === paths.length - 1
      });
    });

    return items;
  }, [location]);
  
  if (breadcrumbs.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center text-sm">
      {breadcrumbs.map((item, index) => (
        <div key={item.path} className="flex items-center">
          {index > 0 && (
            <span className="mx-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          )}
          {item.isCurrent ? (
            <span className="text-gray-700 font-medium">{item.label}</span>
          ) : (
            <Link href={item.path} className="text-indigo-600 hover:text-indigo-700">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}