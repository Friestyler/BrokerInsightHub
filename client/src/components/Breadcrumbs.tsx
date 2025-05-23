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
      return [{
        label: 'Dashboard',
        path: '/',
        isCurrent: true
      }];
    }

    const paths = location.split('/').filter(Boolean);
    let currentPath = '';
    const items: BreadcrumbItem[] = [];

    // Show breadcrumbs for all pages
    if (paths[0] === 'lists') {
      const entityType = paths[1] ? paths[1].charAt(0).toUpperCase() + paths[1].slice(1) : '';

      if (paths.length === 1) {
        // Lists page
        items.push({
          label: 'Lists',
          path: '/lists',
          isCurrent: true
        });
      } else if (paths.length === 2 && entityType) {
        // List type page (Partners, Opportunities, etc.)
        items.push({
          label: entityType,
          path: `/lists/${paths[1]}`,
          isCurrent: true
        });
      } else if (paths.length > 2) {
        // First breadcrumb is the entity type (Partners, Customers, etc.)
        items.push({
          label: entityType,
          path: `/lists/${paths[1]}`,
          isCurrent: false
        });
        
        // Entity detail page
        const entityId = paths[2];
        
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
          const entityMap: Record<string, string> = {
            'partners': 'Partner',
            'customers': 'Customer',
            'opportunities': 'Opportunity',
            'projects': 'Project',
            'contacts': 'Contact'
          };
          
          const entityName = entityMap[paths[1]] || paths[1].slice(0, -1).charAt(0).toUpperCase() + paths[1].slice(0, -1).slice(1);
          items.push({
            label: `${entityName} ${entityId}`,
            path: `/lists/${paths[1]}/${entityId}`,
            isCurrent: true
          });
        }
      }
    } else if (paths.length > 0) {
      // For any other section
      const sectionName = paths[0].charAt(0).toUpperCase() + paths[0].slice(1);
      items.push({
        label: sectionName,
        path: `/${paths[0]}`,
        isCurrent: paths.length === 1
      });
      
      // Add additional path segments if present
      if (paths.length > 1) {
        const subSectionName = paths[1].charAt(0).toUpperCase() + paths[1].slice(1);
        items.push({
          label: subSectionName,
          path: `/${paths[0]}/${paths[1]}`,
          isCurrent: true
        });
      }
    }

    return items;
  }, [location]);
  
  if (breadcrumbs.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center">
      {breadcrumbs.map((item, index) => (
        <div key={item.path} className="flex items-center">
          {index > 0 && (
            <span className="mx-4 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          )}
          {item.isCurrent ? (
            <span 
              className="text-[#282A3F] font-medium" 
              style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
            >
              {item.label}
            </span>
          ) : (
            <Link 
              href={item.path} 
              className="text-indigo-600 hover:text-indigo-700 font-medium"
              style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}