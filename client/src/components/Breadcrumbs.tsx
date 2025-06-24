import { Link, useLocation } from "wouter";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

interface BreadcrumbItem {
  label: string;
  path: string;
  isCurrent: boolean;
}

export default function Breadcrumbs() {
  const [location] = useLocation();
  
  // Parse current location to get entity type and ID
  const paths = location.split('/').filter(Boolean);
  const entityType = paths[0];
  const entityId = paths[1];
  const isDetailPage = !!entityId;
  
  // Fetch data for detail pages
  const { data: partners } = useQuery({
    queryKey: ['/api/partners'],
    enabled: entityType === 'partners' && isDetailPage
  });
  
  const { data: customers } = useQuery({
    queryKey: ['/api/customers'],
    enabled: entityType === 'customers' && isDetailPage
  });
  
  const { data: opportunities } = useQuery({
    queryKey: ['/api/opportunities'],
    enabled: entityType === 'opportunities' && isDetailPage
  });
  
  const breadcrumbs = useMemo(() => {
    if (location === '/') {
      return [];
    }

    const items: BreadcrumbItem[] = [];

    // Define entity type mappings
    const entityMappings: Record<string, { label: string; path: string }> = {
      'partners': { label: 'Partners', path: '/partners' },
      'customers': { label: 'Customers', path: '/customers' },
      'opportunities': { label: 'Opportunities', path: '/opportunities' },
      'products': { label: 'Products', path: '/products' },
      'contacts': { label: 'Contacts', path: '/contacts' },
      'campaigns': { label: 'Campaigns', path: '/campaigns' },
      'templates': { label: 'Templates', path: '/templates' },
      'okr': { label: 'Key Metrics', path: '/okr' },
      'data-upload': { label: 'Data Upload', path: '/data-upload' },
      'portfolio-insights': { label: 'Portfolio Insights', path: '/portfolio-insights' }
    };

    // Handle entity list pages (e.g., /partners, /customers, /opportunities)
    if (entityMappings[entityType] && !isDetailPage) {
      items.push({
        label: entityMappings[entityType].label,
        path: entityMappings[entityType].path,
        isCurrent: true
      });
    }

    // Handle entity detail pages (e.g., /partners/1, /customers/2, /opportunities/3)
    if (entityMappings[entityType] && isDetailPage) {
      // First breadcrumb is the entity type
      items.push({
        label: entityMappings[entityType].label,
        path: entityMappings[entityType].path,
        isCurrent: false
      });
      
      // Second breadcrumb is the specific entity name
      let entityName = `${entityMappings[entityType].label.slice(0, -1)} ${entityId}`; // Remove 's' and add ID
      
      if (entityType === 'partners' && partners) {
        const partner = partners.find((p: any) => p.id.toString() === entityId);
        entityName = partner?.name || `Partner ${entityId}`;
      } else if (entityType === 'customers' && customers) {
        const customer = customers.find((c: any) => c.id.toString() === entityId);
        entityName = customer?.name || `Customer ${entityId}`;
      } else if (entityType === 'opportunities' && opportunities) {
        const opportunity = opportunities.find((o: any) => o.id.toString() === entityId);
        entityName = opportunity?.title || `Opportunity ${entityId}`;
      }
      
      items.push({
        label: entityName,
        path: `/${entityType}/${entityId}`,
        isCurrent: true
      });
    }

    return items;
  }, [location, partners, customers, opportunities, entityType, entityId, isDetailPage]);
  
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