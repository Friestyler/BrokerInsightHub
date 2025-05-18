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

    // Special handling for lists pages and detail pages
    if (paths[0] === 'lists') {
      // Only show the entity type (Partners, Customers, etc.) for list pages
      if (paths.length > 1) {
        const entityType = paths[1].charAt(0).toUpperCase() + paths[1].slice(1);
        
        if (paths.length === 2) {
          // Just show the entity type for list pages
          items.push({
            label: entityType,
            path: `/lists/${paths[1]}`,
            isCurrent: true
          });
        } else if (paths.length > 2) {
          // For detail pages, show both the list and the specific entity
          items.push({
            label: entityType,
            path: `/lists/${paths[1]}`,
            isCurrent: false
          });
          
          // Entity detail page
          const entityId = paths[2];
          
          // Map entity types to more readable names
          const entityMap: Record<string, string> = {
            'partners': 'Partner',
            'customers': 'Customer',
            'opportunities': 'Opportunity',
            'projects': 'Project',
            'contacts': 'Contact'
          };
          
          // For partner detail page with ID 1
          if (paths[1] === 'partners' && entityId === '1') {
            items.push({
              label: 'ABC Insurance',
              path: `/lists/${paths[1]}/${entityId}`,
              isCurrent: true
            });
          } 
          // For other entities, use a generic name with ID
          else {
            const entityName = entityMap[paths[1]] || paths[1].slice(0, -1).charAt(0).toUpperCase() + paths[1].slice(0, -1).slice(1);
            items.push({
              label: `${entityName} ${entityId}`,
              path: `/lists/${paths[1]}/${entityId}`,
              isCurrent: true
            });
          }
        }
      }
    } 
    // For other pages, use the standard approach
    else {
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
        
        items.push({
          label,
          path: currentPath,
          isCurrent: index === paths.length - 1
        });
      });
    }

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