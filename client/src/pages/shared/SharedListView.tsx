import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

export default function SharedListView() {
  const { shareToken } = useParams<{ shareToken: string }>();

  const { data: sharedListData, isLoading, error } = useQuery({
    queryKey: ['/api/shared-lists', shareToken],
    queryFn: async () => {
      const response = await fetch(`/api/shared-lists/${shareToken}`);
      if (!response.ok) {
        throw new Error('Failed to fetch shared list');
      }
      return response.json();
    },
    enabled: !!shareToken,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared list...</p>
        </div>
      </div>
    );
  }

  if (error || !sharedListData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">List Not Found</h1>
          <p className="text-gray-600">This shared list doesn't exist or has expired.</p>
        </div>
      </div>
    );
  }

  const { list_name, list_description, entity_type, data: listData, message, created_at } = sharedListData;

  const renderPartnersTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customers</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opportunities</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {listData.map((partner: any) => (
            <tr key={partner.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                <div className="text-sm text-gray-500">{partner.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.type}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.industry}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={partner.status === 'Active' ? 'default' : 'secondary'}>
                  {partner.status}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.customers || 0}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{partner.opportunities || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCustomersTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {listData.map((customer: any) => (
            <tr key={customer.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{customer.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.partner_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.industry}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderOpportunitiesTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {listData.map((opportunity: any) => (
            <tr key={opportunity.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{opportunity.title}</div>
                <div className="text-sm text-gray-500">{opportunity.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{opportunity.partner_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{opportunity.customer_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {opportunity.value ? `€${Number(opportunity.value).toLocaleString()}` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge variant={opportunity.status === 'Won' ? 'default' : 'secondary'}>
                  {opportunity.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTable = () => {
    switch (entity_type) {
      case 'partners':
        return renderPartnersTable();
      case 'customers':
        return renderCustomersTable();
      case 'opportunities':
        return renderOpportunitiesTable();
      default:
        return <div>Unsupported entity type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{list_name}</h1>
              {list_description && (
                <p className="text-gray-600 mt-1">{list_description}</p>
              )}
              <div className="flex items-center mt-3 text-sm text-gray-500">
                <span className="capitalize">{entity_type.replace('_', ' ')}</span>
                <span className="mx-2">•</span>
                <span>{listData.length} items</span>
                <span className="mx-2">•</span>
                <span>Shared on {new Date(created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Shared List</div>
              <div className="text-sm font-medium text-blue-600">Read Only</div>
            </div>
          </div>
          
          {message && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">{message}</p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {listData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items in this list</h3>
              <p className="text-gray-500">This list is currently empty.</p>
            </div>
          ) : (
            renderTable()
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This is a shared list from Qollabi. Data is read-only.</p>
        </div>
      </div>
    </div>
  );
}