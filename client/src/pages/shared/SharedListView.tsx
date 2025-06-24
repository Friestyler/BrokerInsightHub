import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared list...</p>
        </div>
      </div>
    );
  }

  if (error || !sharedListData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
        <thead className="bg-white">
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
        <thead className="bg-white">
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
        <thead className="bg-white">
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
    <div className="min-h-screen bg-white">
      {/* Light Qollabi Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  Q
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Qollabi</span>
                <span className="ml-2 text-sm text-gray-500 bg-[#E6E7F1] px-2 py-1 rounded-full">
                  Shared View
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Get Your Free Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Call-to-Action Banner */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Want to create and manage your own lists like this?
                </h3>
                <p className="text-gray-600 mb-3">
                  Join thousands of teams using Qollabi to track partners, customers, and opportunities. 
                  Get powerful filtering, sharing, and collaboration features.
                </p>
                <div className="flex items-center space-x-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Start Free Trial
                  </Button>
                  <Button variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shared List Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
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
                <div className="text-sm font-medium text-blue-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Only
                </div>
              </div>
            </div>
            
            {message && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">{message}</p>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-hidden">
            {listData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items in this list</h3>
                <p className="text-gray-500">This list is currently empty.</p>
              </div>
            ) : (
              <div className="relative">
                {renderTable()}
                {/* Subtle overlay to indicate limited functionality */}
                <div className="absolute inset-0 bg-transparent pointer-events-none border border-gray-100 rounded-lg"></div>
              </div>
            )}
          </div>
        </div>

        {/* Features Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <CardTitle className="text-lg">Smart Filtering</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Filter and search through thousands of records instantly with our advanced search capabilities.</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </div>
              <CardTitle className="text-lg">Easy Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Share lists with your team or external partners with flexible permission controls.</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <CardTitle className="text-lg">Analytics & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Get powerful insights from your data with built-in analytics and reporting tools.</p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <Card className="bg-gray-900 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to power up your business relationships?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of companies using Qollabi to manage their partner networks, track opportunities, 
              and grow their business faster.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                Start Your Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                Schedule a Demo
              </Button>
            </div>
            <p className="text-sm text-gray-400 mt-4">No credit card required • 14-day free trial</p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This is a shared list from Qollabi • <Link href="/" className="text-blue-600 hover:underline">Create your own account</Link></p>
        </div>
      </div>
    </div>
  );
}