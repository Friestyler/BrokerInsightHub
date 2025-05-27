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
  const isPartnerDetail = paths[0] === 'partners' && !!paths[1];
  const partnerId = isPartnerDetail ? paths[1] : null;
  
  // Fetch partner data if we're on a partner detail page
  const { data: partners } = useQuery({
    queryKey: ['/api/partners'],
    enabled: isPartnerDetail
  });
  
  const breadcrumbs = useMemo(() => {
    if (location === '/') {
      return [];
    }

    const items: BreadcrumbItem[] = [];

    // Handle partner detail pages
    if (isPartnerDetail && partnerId) {
      // First breadcrumb is Partners
      items.push({
        label: 'Partners',
        path: '/partners',
        isCurrent: false
      });
      
      // Second breadcrumb is the partner name
      const partner = partners?.find((p: any) => p.id.toString() === partnerId);
      const partnerName = partner?.name || `Partner ${partnerId}`;
      
      items.push({
        label: partnerName,
        path: `/partners/${partnerId}`,
        isCurrent: true
      });
    }

    return items;
  }, [location, partners, isPartnerDetail, partnerId]);
  
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