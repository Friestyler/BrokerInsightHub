import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

export default function PartnersViewforPartner() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Fetch partners data
  const { data: partners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/degoudse/partners'],
    queryFn: () => apiRequest('GET', '/api/degoudse/partners'),
    staleTime: 2 * 60 * 1000,
  });

  // Filter partners based on search and location
  const filteredPartners = partners.filter((partner: any) => {
    const matchesSearch = !searchTerm || 
      partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contact_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !selectedLocation || 
      partner.location?.toLowerCase().includes(selectedLocation.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  if (partnersLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading partners...</p>
        </div>
      </div>
    );
  }

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

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner: any) => (
            <div key={partner.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {partner.relationship_count || 0} relationships
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {partner.location && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{partner.location}</span>
                  </div>
                )}

                {partner.contact_email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{partner.contact_email}</span>
                  </div>
                )}

                {partner.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{partner.phone}</span>
                  </div>
                )}

                {partner.primary_contact && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Primary Contact:</span> {partner.primary_contact}
                  </div>
                )}
              </div>

              {partner.description && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 line-clamp-3">{partner.description}</p>
                </div>
              )}
            </div>
          ))}
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