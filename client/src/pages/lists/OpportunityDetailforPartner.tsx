import { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Users, Target } from 'lucide-react';
import { Link } from 'wouter';

// Partner View Layout Component
function PartnerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Partner Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="p-4">
          {/* De Goudse Logo */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-[#003366] rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">DG</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-[#003366]">De Goudse</span>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {!sidebarCollapsed && 'Collaborate'}
            </div>
            
            <Link href="/broker-view">
              <div className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {!sidebarCollapsed && <span>Opportunities</span>}
              </div>
            </Link>

            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-3">
              {!sidebarCollapsed && 'Campaigns'}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Partner Dashboard</h1>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// Utility function for currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// Status color mapping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'New':
      return 'bg-blue-100 text-blue-800';
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'Qualified':
      return 'bg-green-100 text-green-800';
    case 'Closed Won':
      return 'bg-green-100 text-green-800';
    case 'Closed Lost':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Partner Opportunity Detail Page Component
export default function OpportunityDetailforPartner() {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  
  // Get the shared list ID from session storage or default to the first available list
  const getSharedListId = () => {
    const savedListId = sessionStorage.getItem('partnerViewListId');
    return savedListId || '2'; // Default to list ID 2 if none saved
  };
  
  // Fetch opportunity details
  const { data: opportunity, isLoading: opportunityLoading } = useQuery({
    queryKey: ['/api/degoudse/opportunities', opportunityId],
    queryFn: async () => {
      const opportunities = await apiRequest('GET', '/api/degoudse/opportunities');
      return opportunities.find((opp: any) => opp.id === parseInt(opportunityId || '0'));
    },
    enabled: !!opportunityId
  });

  // Fetch related partners
  const { data: relatedPartners = [] } = useQuery({
    queryKey: ['/api/degoudse/partners', opportunityId],
    queryFn: () => apiRequest('GET', '/api/degoudse/partners'),
    enabled: !!opportunityId
  });

  // Fetch related customers
  const { data: relatedCustomers = [] } = useQuery({
    queryKey: ['/api/degoudse/customers', opportunityId],
    queryFn: () => apiRequest('GET', '/api/degoudse/customers'),
    enabled: !!opportunityId
  });

  // Fetch related products
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['/api/degoudse/products', opportunityId],
    queryFn: () => apiRequest('GET', '/api/degoudse/products'),
    enabled: !!opportunityId
  });

  if (opportunityLoading) {
    return (
      <PartnerLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading opportunity details...</p>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  if (!opportunity) {
    return (
      <PartnerLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Opportunity not found</h2>
            <p className="text-gray-600">The opportunity you're looking for doesn't exist or has been removed.</p>
            <Link href="/broker-view">
              <Button className="mt-4">Back to Opportunities</Button>
            </Link>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <Link href={`/broker-view/list/${getSharedListId()}`}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Opportunities
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{opportunity.title}</h1>
                  <p className="text-sm text-gray-500">
                    {opportunity.status} • {opportunity.stage || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opportunity Overview */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Estimated Value</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">
                  {formatCurrency(opportunity.estimatedValue || 0)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Probability</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900">{opportunity.probability}%</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Expected Close</h3>
                <p className="mt-1 text-lg text-gray-900">
                  {opportunity.expectedCloseDate 
                    ? new Date(opportunity.expectedCloseDate).toLocaleDateString()
                    : 'Not set'
                  }
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Type</h3>
                <p className="mt-1 text-lg text-gray-900">{opportunity.type || 'Not specified'}</p>
              </div>
            </div>
            
            {opportunity.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-gray-900">{opportunity.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Customer Info */}
              <div className="flex items-start space-x-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                  <p className="mt-1 text-lg text-gray-900">{opportunity.customerName || 'Not assigned'}</p>
                </div>
              </div>

              {/* Partner Info */}
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Partner</h3>
                  <p className="mt-1 text-lg text-gray-900">{opportunity.partnerName || 'Not assigned'}</p>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Product</h3>
                  <p className="mt-1 text-lg text-gray-900">{opportunity.productName || 'Not assigned'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Opportunity Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(opportunity.status)}`}>
                    {opportunity.status}
                  </span>
                </div>
              </div>

              {opportunity.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                  <p className="mt-1 text-gray-900">{opportunity.notes}</p>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Contact Information</h4>
              <div className="text-sm text-gray-600">
                <p>For additional information about this opportunity, please contact your De Goudse representative.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}