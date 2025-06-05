import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Partner View Layout Component
function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation sidebar for partner view */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo section */}
          <div className="flex h-16 items-center justify-center border-b px-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">DG</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">De Goudse</span>
            </div>
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {/* Broker Copilot - disabled */}
            <div className="flex items-center px-2 py-2 text-sm font-medium text-gray-400 cursor-not-allowed">
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 21H9.154a3.374 3.374 0 00-2.569-1.1l-.548-.547z" />
              </svg>
              Broker Copilot
            </div>

            {/* Collaborate section */}
            <div className="mt-6">
              <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Collaborate
              </div>
              <div className="mt-2 space-y-1">
                <a
                  href="/partner-view"
                  className="bg-blue-50 text-blue-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <svg className="text-blue-500 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Opportunities
                </a>
              </div>
            </div>

            {/* Campaigns */}
            <div className="mt-6">
              <a
                href="#"
                className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              >
                <svg className="text-gray-400 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                Campaigns
              </a>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

// Partner View Page Component
export default function PartnerView() {
  const { listId } = useParams<{ listId: string }>();
  const [opportunities, setOpportunities] = useState<any[]>([]);

  // Fetch the shared list details
  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['/api/degoudse/saved-lists', listId],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/degoudse/saved-lists`);
      return response.find((list: any) => list.id === parseInt(listId || '0'));
    },
    enabled: !!listId
  });

  // Fetch opportunities based on list members
  const { data: allOpportunities = [], isLoading: opportunitiesLoading } = useQuery({
    queryKey: ['/api/degoudse/opportunities'],
    queryFn: () => apiRequest('GET', '/api/degoudse/opportunities'),
    staleTime: 2 * 60 * 1000,
  });

  // Filter opportunities based on list members
  useEffect(() => {
    if (listData && allOpportunities.length > 0) {
      if (listData.members && listData.members.length > 0) {
        // Filter by specific opportunity IDs
        const filteredOpps = allOpportunities.filter((opp: any) => 
          listData.members.includes(opp.id)
        );
        setOpportunities(filteredOpps);
      } else {
        // Apply filters from the list
        let filtered = allOpportunities;
        if (listData.filters) {
          const filters = typeof listData.filters === 'string' ? JSON.parse(listData.filters) : listData.filters;
          
          if (filters.searchText) {
            filtered = filtered.filter((opp: any) =>
              opp.title?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
              opp.description?.toLowerCase().includes(filters.searchText.toLowerCase())
            );
          }
          
          if (filters.status) {
            filtered = filtered.filter((opp: any) => opp.status === filters.status);
          }
          
          if (filters.type) {
            filtered = filtered.filter((opp: any) => opp.type === filters.type);
          }
        }
        setOpportunities(filtered);
      }
    }
  }, [listData, allOpportunities]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Qualifying': return 'bg-yellow-100 text-yellow-800';
      case 'Needs Analysis': return 'bg-blue-100 text-blue-800';
      case 'Proposal': return 'bg-purple-100 text-purple-800';
      case 'Negotiation': return 'bg-orange-100 text-orange-800';
      case 'Closed Won': return 'bg-green-100 text-green-800';
      case 'Closed Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  if (listLoading || opportunitiesLoading) {
    return (
      <PartnerLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  if (!listData) {
    return (
      <PartnerLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">List not found</h2>
            <p className="text-gray-600">The shared list you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{listData.name}</h1>
              {listData.description && (
                <p className="text-gray-600 mt-1">{listData.description}</p>
              )}
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <span>{opportunities.length} opportunities</span>
                <span className="mx-2">•</span>
                <span>Shared by De Goudse</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Value</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(opportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0))}
              </div>
            </div>
          </div>
        </div>

        {/* Opportunities table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opportunity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Probability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {opportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {opportunity.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {opportunity.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${getStatusColor(opportunity.status)} border-0`}>
                        {opportunity.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(opportunity.estimatedValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {opportunity.probability}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {opportunity.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty state */}
        {opportunities.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No opportunities</h3>
            <p className="mt-1 text-sm text-gray-500">This list doesn't contain any opportunities.</p>
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}