import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

// Format currency for European format
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Calculate partner statistics
function calculatePartnerStats(partners: any[]) {
  const totalPartners = partners.length;
  const totalCustomers = partners.reduce((sum, partner) => {
    const customerCount = parseInt(partner.customers) || 0;
    return sum + customerCount;
  }, 0);
  const totalOpportunities = partners.reduce((sum, partner) => {
    const opportunityCount = parseInt(partner.opportunities) || 0;
    return sum + opportunityCount;
  }, 0);
  const totalValue = partners.reduce((sum, partner) => {
    const value = parseFloat(partner.opportunity_value) || 0;
    return sum + value;
  }, 0);
  const weightedValue = partners.reduce((sum, partner) => {
    const value = parseFloat(partner.weighted_opportunity_value) || 0;
    return sum + value;
  }, 0);
  
  return {
    totalPartners,
    totalCustomers,
    totalOpportunities,
    totalValue,
    weightedValue
  };
}

// Partner Table Component for Partner View
function PartnerTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedPartners, setSelectedPartners] = useState<string[]>([]);
  const [tableSortConfig, setTableSortConfig] = useState({
    key: '',
    direction: 'asc' as 'asc' | 'desc'
  });

  // Show only De Goudse as the partner since they shared the list
  const deGoudsePartner = {
    id: 'degoudse',
    name: 'De Goudse',
    primary_contact: 'Partner Representative',
    contact_email: 'partner@degoudse.nl',
    location: 'Netherlands',
    phone: '+31 20 123 4567',
    description: 'Insurance company that shared this list',
    industry: 'Insurance',
    type: 'Insurance Provider',
    status: 'Active',
    size: 'Large',
    region: 'Netherlands',
    relationship_count: 1,
    customers: 8,
    opportunities: 15,
    opportunity_value: 1350000,
    weighted_opportunity_value: 945000
  };

  // Only show De Goudse in broker view
  const allPartners = [deGoudsePartner];
  const partnersLoading = false;

  // Handle table sorting
  const handleSort = (key: string) => {
    setTableSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter and sort partners
  const filteredPartners = allPartners
    .filter((partner: any) => {
      const matchesSearch = !searchTerm || 
        partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.primary_contact?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLocation = !selectedLocation || 
        partner.location?.toLowerCase().includes(selectedLocation.toLowerCase());
      
      return matchesSearch && matchesLocation;
    })
    .sort((a: any, b: any) => {
      if (!tableSortConfig.key) {
        return a.name.localeCompare(b.name);
      }
      
      const aValue = a[tableSortConfig.key] || '';
      const bValue = b[tableSortConfig.key] || '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue);
        return tableSortConfig.direction === 'asc' ? result : -result;
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const result = aValue - bValue;
        return tableSortConfig.direction === 'asc' ? result : -result;
      }
      
      return 0;
    });

  if (partnersLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading partners...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <input
                type="text"
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="w-48">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Locations</option>
              <option value="Amsterdam">Amsterdam</option>
              <option value="Rotterdam">Rotterdam</option>
              <option value="Utrecht">Utrecht</option>
              <option value="Netherlands">Netherlands</option>
              <option value="The Hague">The Hague</option>
            </select>
          </div>

          {(searchTerm || selectedLocation) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedLocation('');
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Bulk actions bar - always visible */}
      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex flex-wrap items-center justify-between mb-4" style={{ minHeight: '64px' }}>
        {selectedPartners.length > 0 ? (
          <>
            <div className="flex items-center">
              <span className="text-indigo-700 font-medium mr-2">
                {selectedPartners.length} {selectedPartners.length === 1 ? 'partner' : 'partners'} selected
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-600"
                onClick={() => setSelectedPartners([])}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
                Clear selection
              </Button>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                className="text-indigo-600"
                onClick={() => {/* Add export functionality */}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7,10 12,15 17,10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export Selected
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full min-h-[32px]">
            <div className="flex items-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M9 12l2 2 4-4"></path>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              </svg>
              <span className="text-sm">Select at least one partner from the list to perform bulk actions</span>
            </div>
          </div>
        )}
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="w-12 group relative px-6 py-3 text-left text-xs font-medium text-[#696C8C] uppercase tracking-wider" style={{ fontFamily: 'Poppins, sans-serif', fontSize: '13px' }}>
                  <div className={`transition-opacity ${
                    selectedPartners.length > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}>
                    <Checkbox 
                      checked={selectedPartners.length === filteredPartners.length && filteredPartners.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedPartners(filteredPartners.map((p: any) => p.id));
                        } else {
                          setSelectedPartners([]);
                        }
                      }}
                    />
                  </div>
                </th>
                <SortableTableHead 
                  sortKey="name" 
                  currentSortKey={tableSortConfig.key} 
                  currentDirection={tableSortConfig.direction} 
                  onSort={handleSort}
                  className="min-w-[200px]"
                >
                  Partner Name
                </SortableTableHead>
                <SortableTableHead 
                  sortKey="primary_contact" 
                  currentSortKey={tableSortConfig.key} 
                  currentDirection={tableSortConfig.direction} 
                  onSort={handleSort}
                  className="min-w-[150px]"
                >
                  Contact
                </SortableTableHead>
                <SortableTableHead 
                  sortKey="location" 
                  currentSortKey={tableSortConfig.key} 
                  currentDirection={tableSortConfig.direction} 
                  onSort={handleSort}
                  className="min-w-[120px]"
                >
                  Location
                </SortableTableHead>
                <SortableTableHead 
                  sortKey="industry" 
                  currentSortKey={tableSortConfig.key} 
                  currentDirection={tableSortConfig.direction} 
                  onSort={handleSort}
                  className="min-w-[120px]"
                >
                  Industry
                </SortableTableHead>
                <SortableTableHead 
                  sortKey="type" 
                  currentSortKey={tableSortConfig.key} 
                  currentDirection={tableSortConfig.direction} 
                  onSort={handleSort}
                  className="min-w-[120px]"
                >
                  Type
                </SortableTableHead>
                <SortableTableHead 
                  sortKey="status" 
                  currentSortKey={tableSortConfig.key} 
                  currentDirection={tableSortConfig.direction} 
                  onSort={handleSort}
                  className="min-w-[100px]"
                >
                  Status
                </SortableTableHead>
                <SortableTableHead 
                  sortKey="relationship_count" 
                  currentSortKey={tableSortConfig.key} 
                  currentDirection={tableSortConfig.direction} 
                  onSort={handleSort}
                  className="min-w-[120px]"
                >
                  Relationships
                </SortableTableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredPartners.map((partner: any) => (
                <tr key={partner.id} className="group hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                    <div className={`transition-opacity ${
                      selectedPartners.includes(partner.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      <Checkbox 
                        checked={selectedPartners.includes(partner.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPartners([...selectedPartners, partner.id]);
                          } else {
                            setSelectedPartners(selectedPartners.filter(id => id !== partner.id));
                          }
                        }}
                      />
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <Link href={`/broker-view/partner/${partner.id}`}>
                          <div 
                            className="font-medium text-gray-900 hover:text-indigo-600 cursor-pointer"
                            onClick={() => {
                              // Clear any stored list ID and set the source as partners page
                              sessionStorage.removeItem('partnerViewListId');
                              sessionStorage.setItem('partnerViewSource', 'partners');
                            }}
                          >
                            {partner.name}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div>
                      <div className="text-gray-900">{partner.primary_contact}</div>
                      <div className="text-gray-500">{partner.contact_email}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {partner.location}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {partner.industry}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {partner.type}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <Badge 
                      variant={partner.status === 'Active' ? 'default' : 'secondary'}
                      className={partner.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {partner.status}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {partner.relationship_count || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredPartners.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No partners found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedLocation ? 'Try adjusting your search criteria.' : 'No partners are available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PartnersViewforPartner() {
  // Use hardcoded De Goudse partner data for statistics
  const deGoudsePartnerForStats = {
    id: 'degoudse',
    name: 'De Goudse',
    customers: 8,
    opportunities: 15,
    opportunity_value: 1350000,
    weighted_opportunity_value: 945000
  };

  // Calculate statistics from hardcoded data
  const stats = calculatePartnerStats([deGoudsePartnerForStats]);

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
            <p className="text-gray-600 mt-1">View partner information and contact details</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="bg-white p-4 rounded-md border border-gray-200 flex-1 min-w-[160px]">
            <div className="text-xl font-semibold">{stats.totalPartners}</div>
            <div className="text-sm text-gray-500">Total Partners</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200 flex-1 min-w-[160px]">
            <div className="text-xl font-semibold">{stats.totalOpportunities}</div>
            <div className="text-sm text-gray-500">Total Opportunities</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200 flex-1 min-w-[160px]">
            <div className="text-xl font-semibold">{stats.totalCustomers}</div>
            <div className="text-sm text-gray-500">Total Customers</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200 flex-1 min-w-[160px]">
            <div className="text-xl font-semibold">{formatCurrency(stats.totalValue)}</div>
            <div className="text-sm text-gray-500">Total Value Opportunities</div>
          </div>
          
          <div className="bg-white p-4 rounded-md border border-gray-200 flex-1 min-w-[160px]">
            <div className="text-xl font-semibold">{formatCurrency(Math.round(stats.weightedValue))}</div>
            <div className="text-sm text-gray-500">Weighted Value Opportunities</div>
          </div>
        </div>

        {/* Partners Table */}
        <PartnerTable />
      </div>
    </div>
  );
}