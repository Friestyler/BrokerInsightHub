import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

// Partner View Layout Component
function PartnerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dataMenuOpen, setDataMenuOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"} flex-shrink-0`}>
        {/* Logo */}
        <div className="h-14 border-b border-gray-100 flex items-center px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#003366] rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">DG</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-[#003366]">De Goudse</span>
            )}
          </div>
        </div>

        {/* Navigation menu */}
        <div className="flex flex-col flex-shrink-0 overflow-y-auto px-2 pt-4">
          {/* Broker Copilot - disabled */}
          <div className="flex items-center py-2.5 px-4 rounded-md text-gray-400 cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              <path d="M5 3v4" />
              <path d="M19 17v4" />
              <path d="M3 5h4" />
              <path d="M17 19h4" />
            </svg>
            <span className={`ml-3 text-sm ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}>
              Broker Copilot
            </span>
          </div>

          {/* Collaborate section */}
          <div className="relative">
            <button 
              className={`flex items-center py-2.5 px-4 rounded-md w-full text-left ${dataMenuOpen ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"}`}
              onClick={() => setDataMenuOpen(!dataMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
              </svg>
              <span className={`ml-3 text-sm ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}>
                Collaborate
              </span>
              {!sidebarCollapsed && (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="14" 
                  height="14" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`ml-auto transition-transform ${dataMenuOpen ? 'rotate-180' : ''} ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              )}
            </button>
            
            {/* Dropdown menu - show Opportunities and Partners */}
            {dataMenuOpen && (
              <div className={`${sidebarCollapsed ? "absolute left-16 top-0 bg-white border border-gray-200 rounded-md shadow-md py-1 z-50 w-48" : "mt-0.5"}`}>
                <Link href="/partner-view/list/2">
                  <div className={`flex py-2 text-sm ${sidebarCollapsed ? "px-4" : "pl-12"} w-full text-left text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    Opportunities
                  </div>
                </Link>
                <div className={`flex py-2 text-sm ${sidebarCollapsed ? "px-4" : "pl-12"} w-full text-left bg-indigo-50 text-indigo-600 font-medium`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Partners
                </div>
              </div>
            )}
          </div>

          {/* Campaigns */}
          <div className="flex items-center py-2.5 px-4 rounded-md text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-center" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9 22 2z" />
            </svg>
            <span className={`ml-3 text-sm ${sidebarCollapsed ? "hidden" : "hidden md:inline-block"}`}>Campaigns</span>
          </div>
        </div>
      </div>
      
      {/* Main content column with top bar */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Top bar */}
        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <button 
              className="text-gray-600 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50 focus:outline-none"
              onClick={toggleSidebar}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Partner Dashboard</h1>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Partners View for Partner Page Component
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
      <PartnerLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading partners...</p>
          </div>
        </div>
      </PartnerLayout>
    );
  }

  return (
    <PartnerLayout>
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
    </PartnerLayout>
  );
}